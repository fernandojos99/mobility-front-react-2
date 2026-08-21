/**
 * Pantalla `/yo/gap` — **Mi puesto**: qué tan bien cubres el puesto que ocupas HOY.
 *
 * Cuatro apartados y nada más: la caja de avance, tu desempeño, tus capacidades y lo que sugiere el
 * sistema. Las tarjetas de IPN, Felicidad, Valores, Aprendizaje y Coaching **siguen existiendo y
 * siguen compilando** (`components/talento/TarjetasTalento.tsx`); lo que pasa es que esta pantalla
 * dejó de montarlas. El backend sigue sirviendo esos datos, así que devolverlas es una línea.
 *
 * Los valores no desaparecen: viven dentro de la tabla de desempeño, detrás de la columna
 * "Valores", que es de donde salen.
 *
 * La piel es la de `/yo` (`gs.css` + `talento.css`) y la caja oscura es la misma de
 * `/yo/aspiracion`, por eso entra `roadmap.css` y el envoltorio `.rm`.
 */
import { useEffect, useState } from "react";
import { ChevronDown, Sparkles, Target } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { useData } from "../store/DataProvider";
import { useYo } from "../hooks/useYo";
import { CajaVacia } from "../components/common/CajaVacia";
import { HeroPerfilGS } from "../components/perfil/HeroPerfilGS";
import { RecomendacionIA } from "../components/talento/RecomendacionIA";
import { TarjetaCapacidades, TarjetaDesempeno } from "../components/talento/TarjetasTalento";
import "../components/perfil/gs.css";
import "../components/roadmap/roadmap.css";
import "../components/talento/talento.css";
import type { GapActual } from "../types/domain";

/**
 * Cuánto cubres del puesto que ya ocupas.
 *
 * Es la caja de `HeroBrujula`, pero mirando hacia dentro en vez de hacia el siguiente puesto: allí
 * el número es la preparación para el destino y aquí es el `cumplimiento` del descriptivo actual —
 * el mismo que enseña la tarjeta "Puesto actual" de Aspiraciones, para que no digan cosas distintas.
 */
function AvancePuesto({ gap }: { gap: GapActual }) {
  const pendientes = gap.bloques.filter((b) => b.estado !== "ok").length;
  const anos = Math.floor(gap.antiguedadMeses / 12);
  const meses = gap.antiguedadMeses % 12;
  const antiguedad = anos > 0
    ? `${anos} ${anos === 1 ? "año" : "años"}${meses ? ` y ${meses} m` : ""}`
    : `${meses} ${meses === 1 ? "mes" : "meses"}`;

  return (
    <section className="rm-hero" aria-label="Qué tanto cubres tu puesto actual">
      <div className="rm-hero-top">
        <div>
          <p className="rm-kicker">Tu puesto de hoy · {antiguedad} en él</p>
          <h2>{gap.puestoTitulo}</h2>
        </div>
        <div className="rm-hero-icono"><Target size={24} /></div>
      </div>

      <div className="rm-hero-prog">
        <div>
          <strong>{gap.cumplimiento}%</strong>
          <span>del descriptivo</span>
        </div>
        <div className="rm-barra-caja">
          <div className="rm-barra"><span style={{ width: `${gap.cumplimiento}%` }} /></div>
          <div className="rm-barra-rot"><span>Hoy</span><span>Puesto cubierto</span></div>
        </div>
      </div>

      <p className="rm-hero-nota">
        <Sparkles size={15} style={{ flexShrink: 0 }} />
        {pendientes === 0 ? (
          <span>Cubres tu puesto por completo. <strong>Es el momento de mirar el siguiente.</strong></span>
        ) : (
          <span>
            {pendientes === 1 ? "Queda" : "Quedan"}{" "}
            <strong>{pendientes} {pendientes === 1 ? "bloque" : "bloques"}</strong> por reforzar en
            tu puesto actual.
          </span>
        )}
      </p>
    </section>
  );
}

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
  const capacidades = catalogos?.nivelesCapacidad ?? [];

  return (
    <div className="gs-fondo">
      <div className="gs">
        <HeroPerfilGS yo={yo} puesto={puestoDe(yo.puestoActualId)} />

        <div className="rm">
          <div style={{ padding: "0 .5rem" }}>
            {gap && <AvancePuesto gap={gap} />}
          </div>
        </div>

        <div style={{ padding: "1rem .5rem 0" }}>
          {t ? (
            <div className="tl-col">
              <TarjetaDesempeno t={t} escala={escala} valores={t.valores} niveles={niveles} />
              <TarjetaCapacidades ps={t.psicometrias} niveles={capacidades} />
            </div>
          ) : (
            <section className="gs-card" style={{ margin: 0 }}>
              <div className="gs-vacio">
                <CajaVacia />
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
