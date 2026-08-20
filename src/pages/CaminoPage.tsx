/**
 * Pantalla 3b — El camino, con el mapa.
 *
 * Aquí sólo va el mapa. La lista que repetía el camino en texto se quitó a propósito: el detalle de
 * cada paso vive ahora en la hoja que se abre al pulsar un nodo (`HojaHito`), que muestra estado,
 * niveles, prioridad y cómo cumplirlo.
 *
 * OJO con lo que eso cuesta: el recorrido completo en texto ya no está en esta pantalla, hay que
 * abrir los nodos uno a uno. Quien quiera leerlo de corrido lo tiene en `/yo/aspiracion`, en "Mi
 * ruta".
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Lock, ExternalLink } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { useYo } from "../hooks/useYo";
import { MapaCamino } from "../components/mapa/MapaCamino";
import { AnilloAvance } from "../components/common/AnilloAvance";
import type { Camino } from "../types/domain";

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
