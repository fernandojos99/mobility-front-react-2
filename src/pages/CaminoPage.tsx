/**
 * Pantalla 3b — El camino, con el mapa.
 *
 * El mapa emociona; la lista informa. Hacen falta las dos: debajo del SVG va exactamente la misma
 * información en texto, que es la ruta de escape para quien no pueda con el mapa y la forma de
 * leerla con calma para todos los demás.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Star, Flag, ExternalLink } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { useYo } from "../hooks/useYo";
import { MapaCamino } from "../components/mapa/MapaCamino";
import { AnilloAvance } from "../components/common/AnilloAvance";
import { Chip } from "../components/common/Chip";
import type { Camino, Hito } from "../types/domain";

const ICONO_ESTADO: Record<Hito["estado"], React.ReactNode> = {
  cumplido: <Star size={13} />,
  actual: <Flag size={13} />,
  bloqueado: <Lock size={13} />,
};
const TONO_ESTADO: Record<Hito["estado"], string> = { cumplido: "ok", actual: "gold", bloqueado: "lock" };
const PALABRA_ESTADO: Record<Hito["estado"], string> = {
  cumplido: "Cumplido", actual: "Tu siguiente paso", bloqueado: "Bloqueado",
};

export function CaminoPage() {
  const yo = useYo();
  const { puestoId } = useParams<{ puestoId: string }>();
  const [camino, setCamino] = useState<Camino | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!yo || !puestoId) return;
    setCamino(null);
    colaboradorService.camino(yo.id, puestoId).then(setCamino)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo calcular el camino"));
  }, [yo, puestoId]);

  if (error) return <div className="card"><b style={{ color: "var(--bad)" }}>{error}</b></div>;
  if (!camino) return <div className="spin" />;

  return (
    <>
      <div className="card">
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/yo/aspiracion" className="btn ghost sm"><ArrowLeft size={14} /> Volver</Link>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="help" style={{ marginTop: 0 }}>Camino hacia</div>
            <b style={{ fontSize: 16 }}>{camino.puestoObjetivoTitulo}</b>
          </div>
          <AnilloAvance v={camino.compatibilidad} titulo={`${camino.compatibilidad}% de compatibilidad`} />
        </div>
        {camino.bloqueo.bloqueado && (
          <p className="help" style={{ marginTop: 12 }}>
            <Lock size={12} /> {camino.bloqueo.mensaje}
          </p>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <MapaCamino hitos={camino.hitos} objetivo={camino.puestoObjetivoTitulo} avance={camino.avance} />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h4 style={{ fontSize: 14, marginBottom: 4 }}>Tu camino, paso a paso</h4>
        <p className="help" style={{ marginTop: 0, marginBottom: 6 }}>
          La misma información del mapa, en texto.
        </p>
        {camino.hitos.map((h, i) => (
          <div key={h.id} className="trow" style={{ alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 99, flexShrink: 0, marginTop: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: h.estado === "cumplido" ? "var(--ok)" : h.estado === "actual" ? "var(--node)" : "var(--lock)",
              color: "#fff",
            }}>{i + 1}</div>
            <div className="trow-main">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <b style={{ fontSize: 13.5 }}>{h.titulo}</b>
                <Chip tone={TONO_ESTADO[h.estado]}>{ICONO_ESTADO[h.estado]} {PALABRA_ESTADO[h.estado]}</Chip>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.5, marginTop: 5 }}>{h.descripcion}</p>
              {/* Los mismos niveles que enseña /yo/aspiracion. Si un dato apareciera en una pantalla
                  y no en la otra, dejarían de ser la misma información. */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, fontSize: 11.5, color: "var(--gray)" }}>
                <span>Hoy <b style={{ color: "var(--ink2)" }}>{h.nivelActual}/5</b></span>
                <span>→</span>
                <span>Meta <b style={{ color: "var(--ink2)" }}>{h.nivelMeta}/5</b></span>
                <Chip tone={h.prioridad === "alta" ? "bad" : h.prioridad === "media" ? "gold" : "ok"}>
                  Prioridad {h.prioridad}
                </Chip>
              </div>
              {h.comoCumplirlo.length > 0 && (
                <ul style={{ listStyle: "none", marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                  {h.comoCumplirlo.map((paso) => (
                    <li key={paso} style={{ fontSize: 12.5, color: "var(--gray)", display: "flex", gap: 7 }}>
                      <span style={{ color: "var(--brand)" }}>◆</span>{paso}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <b style={{ fontSize: 13.5 }}>¿Ya cumples todo?</b>
        <p className="help" style={{ marginTop: 5 }}>
          Cuando el camino esté completo y no tengas bloqueos, la postulación se hace en Radar de
          Candidatos. Aquí solo se muestra el camino.
        </p>
        <Link to="/oportunidades" className="btn ghost sm" style={{ marginTop: 10 }}>
          Ver oportunidades <ExternalLink size={13} />
        </Link>
      </div>
    </>
  );
}
