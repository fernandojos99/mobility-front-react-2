/**
 * Pantalla `/yo/gap` — Perfil de talento.
 *
 * Las secciones son las del dashboard `front/employee/employee-performance-dashboard/` (Desempeño,
 * IPN, Psicometrías, Felicidad, Valores, Aprendizaje, Coaching), **re-vestidas con el diseño de
 * `/yo`**: su paleta —marino y carmesí— no se porta, ver `components/talento/talento.css`.
 *
 * Del dashboard se descartan su barra superior y su `profile-hero`; arriba va el hero de perfil de
 * `/yo`, que es el mismo componente (`HeroPerfilGS`), no una copia.
 *
 * La caja de recomendaciones sigue siendo índigo, que es la convención del proyecto para lo que
 * genera el sistema.
 */
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { useData } from "../store/DataProvider";
import { useYo } from "../hooks/useYo";
import { HeroPerfilGS } from "../components/perfil/HeroPerfilGS";
import { RecomendacionIA } from "../components/talento/RecomendacionIA";
import {
  TarjetaAprendizaje, TarjetaCoaching, TarjetaDesempeno, TarjetaFelicidad,
  TarjetaIpn, TarjetaPsicometrias, TarjetaValores,
} from "../components/talento/TarjetasTalento";
import "../components/perfil/gs.css";
import "../components/talento/talento.css";
import type { GapActual } from "../types/domain";

/** Ilustración del estado vacío, la misma que usan las tarjetas de `/yo`. */
const IMG_VACIO =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qZhJ4xiN289ReGpMhdVFZpEEq8U6Gv.png";

export function GapActualPage() {
  const yo = useYo();
  const { catalogos, puestoDe } = useData();
  const [gap, setGap] = useState<GapActual | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!yo) return;
    setGap(null);
    colaboradorService.gap(yo.id).then(setGap)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo calcular tu desarrollo"));
  }, [yo]);

  if (error) return <div className="card"><b style={{ color: "var(--bad)" }}>{error}</b></div>;
  if (!yo) return <div className="spin" />;

  const t = yo.talento;
  const escala = catalogos?.escalaDesempeno ?? [];
  const niveles = catalogos?.nivelesValor ?? [];

  return (
    <div className="gs-fondo">
      <div className="gs">
        <HeroPerfilGS yo={yo} puesto={puestoDe(yo.puestoActualId)} />

        <div style={{ padding: "1rem .5rem 0" }}>
          {t ? (
            <div className="tl-grid">
              <div className="tl-col">
                <TarjetaDesempeno t={t} escala={escala} />
                <TarjetaIpn ipn={t.ipn} />
                <TarjetaPsicometrias ps={t.psicometrias} />
              </div>
              <div className="tl-col">
                <TarjetaFelicidad ipn={t.ipn} />
                <TarjetaValores valores={t.valores} niveles={niveles} />
                <TarjetaAprendizaje lineas={t.aprendizaje} />
                <TarjetaCoaching coaching={t.coaching} mentoring={t.mentoring} />
              </div>
            </div>
          ) : (
            <section className="gs-card" style={{ margin: 0 }}>
              <div className="gs-vacio">
                <img src={IMG_VACIO} alt="Ilustración de una caja vacía" />
                <h4>Aún no hay datos</h4>
                <p>Todavía no tienes expediente de talento. Se llena con tu evaluación anual.</p>
              </div>
            </section>
          )}

          {/* Las sugerencias no dependen del expediente: salen del gap contra tu puesto actual. */}
          {gap && (
            <div style={{ marginTop: "1rem" }}>
              <RecomendacionIA sugerencias={gap.sugerencias} />
            </div>
          )}
        </div>

        {t && (
          <footer className="tl-pie">
            Última actualización · {t.actualizado} <ChevronDown size={14} />
          </footer>
        )}
      </div>
    </div>
  );
}
