/**
 * Tarjeta de vacante. Réplica de la de Radar de Candidatos (`BuscarVacantesPage`), porque el brief
 * pide expresamente que "se vean igual a las vacantes que están en radar de candidatos".
 *
 * Aquí solo se MUESTRAN: el botón lleva a Radar. Y si la compatibilidad no alcanza, no lleva a
 * ningún lado — lleva al camino. Ese es el producto entero en un botón.
 *
 * La piel es la de `/yo` y sus hermanas: clases `op-*` sobre los tokens `--gs-*`/`--rm-*`, no las
 * de `base.css`.
 */
import { MapPin, Calendar, Lock, ExternalLink, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import { AnilloAvance } from "../common/AnilloAvance";
import { money, plural } from "../../utils/format";
import type { VacanteOportunidad } from "../../types/domain";

export function VacanteCard({
  vacante, compatibilidad, bloqueo, capacidadesFaltantes,
}: VacanteOportunidad) {
  return (
    <article className={"op-card" + (bloqueo.bloqueado ? " bloqueada" : "")}>
      <div className="op-card-cab">
        <div className="op-card-tit">
          <b>{vacante.req.titulo}</b>
          <div className="op-tags" style={{ marginTop: 6 }}>
            <span className="op-tag">{vacante.req.area}</span>
            <span className="op-tag">
              <MapPin size={11} /> {vacante.req.ubicacionTrabajo} · {vacante.req.modalidad}
            </span>
          </div>
        </div>
        <AnilloAvance v={compatibilidad} titulo={`${compatibilidad}% de compatibilidad`} />
      </div>

      <p>{vacante.req.descripcion.slice(0, 110)}…</p>

      {!vacante.req.sueldoOculto && vacante.req.sueldo != null && (
        <div className="op-sueldo">{money(vacante.req.sueldo)} /mes</div>
      )}

      <div className="op-meta"><Calendar size={11} /> Publicada el {vacante.creada}</div>

      {/* El bloqueo NUNCA es solo el número: junto al candado va qué falta y para cuándo. */}
      {bloqueo.bloqueado && (
        <div className="op-sep">
          <span className="op-tag lock">
            <Lock size={11} />
            {bloqueo.motivo === "antiguedad" ? "Te falta antigüedad" : "Todavía no encaja"}
          </span>
          <p style={{ marginTop: 7, fontSize: 11.5 }}>{bloqueo.mensaje}</p>
          {bloqueo.motivo === "compatibilidad" && capacidadesFaltantes.length > 0 && (
            <div className="op-tags" style={{ marginTop: 8 }}>
              {capacidadesFaltantes.map((c) => <span key={c} className="op-tag falta">{c}</span>)}
            </div>
          )}
        </div>
      )}

      <div className="op-pie">
        {bloqueo.bloqueado ? (
          <Link to={`/yo/camino/${vacante.puestoId}`} className="op-btn pri">
            <MapPinned size={14} /> Ver mi camino
          </Link>
        ) : (
          <a href={vacante.urlRadar} target="_blank" rel="noreferrer" className="op-btn oscuro">
            Postularme en Radar <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}

/** Texto corto para la cabecera de la lista. */
export const resumenBloqueos = (n: number, total: number): string =>
  n === 0
    ? `Puedes postularte a las ${total} vacantes que se te muestran.`
    : `${plural(n, "vacante bloqueada", "vacantes bloqueadas")} de ${total}. En cada una puedes ver tu camino.`;
