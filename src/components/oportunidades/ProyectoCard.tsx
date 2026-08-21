/**
 * Tarjeta de proyecto lateral.
 *
 * La validación de entrada NO es un adorno: existe para no desgastar a los dueños de proyectos.
 * Cuando no califica, se dice exactamente qué falta, no "no cumples los requisitos".
 *
 * Y aquí la antigüedad no pinta nada: el brief lo dice explícitamente, y es coherente — los
 * proyectos son justo por donde alguien nuevo empieza a construir su historial.
 *
 * La piel es la de `/yo` y sus hermanas: clases `op-*` sobre los tokens `--gs-*`/`--rm-*`.
 */
import { Lightbulb, Settings2, Boxes, Users, Clock, Target, CheckCircle2, Heart, Sparkles } from "lucide-react";
import type { ProyectoOportunidad } from "../../types/domain";

const ICONO_TIPO = {
  "Innovación": Lightbulb,
  "Mejora de procesos": Settings2,
  "Otro": Boxes,
} as const;

interface Props extends ProyectoOportunidad {
  postulando: boolean;
  onPostular: (id: string) => void;
  favorito: boolean;
  onFavorito: (id: string) => void;
}

export function ProyectoCard({
  proyecto, califica, faltantes, participa, postulando, onPostular, favorito, onFavorito,
}: Props) {
  const Icono = ICONO_TIPO[proyecto.tipo];

  return (
    <article className="op-card">
      <div>
        <b style={{ fontSize: 14.5, lineHeight: 1.3, display: "block" }}>{proyecto.nombre}</b>
        <div className="op-tags" style={{ marginTop: 6 }}>
          <span className={"op-tag" + (proyecto.tipo === "Innovación" ? " azul" : "")}>
            <Icono size={11} /> {proyecto.tipo}
          </span>
          <span className="op-tag">{proyecto.sector}</span>
        </div>
      </div>

      <p>{proyecto.descripcion}</p>

      <div>
        <div className="op-meta" style={{ marginBottom: 5 }}>Responsabilidades</div>
        <ul className="op-lista">
          {proyecto.responsabilidades.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>

      <div className="op-kpi">
        <Target size={13} style={{ flexShrink: 0, marginTop: 2 }} />
        <span><b>KPI:</b> {proyecto.kpi}</span>
      </div>

      {/* Lo que el proyecto DEJA. Es el argumento para entrar, y hasta ahora no se veía. */}
      {proyecto.habilidadesQueGanas.length > 0 && (
        <div className="op-ganas">
          <div className="op-ganas-tit"><Sparkles size={12} /> Lo que te llevas</div>
          <div className="op-tags">
            {proyecto.habilidadesQueGanas.map((h) => (
              <span className="op-tag gana" key={h}>{h}</span>
            ))}
          </div>
        </div>
      )}

      <div className="op-tags">
        <span className="op-tag"><Clock size={11} /> {proyecto.duracionMeses} meses</span>
        <span className="op-tag"><Users size={11} /> {proyecto.cupo} lugares</span>
      </div>
      <div className="op-meta">{proyecto.dueno} · {proyecto.unidadNegocio}</div>

      <div className="op-pie op-sep">
        {/* Todo lo que no es el corazón va en UN solo contenedor: `.op-pie` es una fila flex, y sin
            esto cada trozo del bloque "para entrar te falta" se convertía en una columna suelta. */}
        <div className="op-pie-main">
        {participa ? (
          <span className="op-tag ok"><CheckCircle2 size={11} /> Ya participas</span>
        ) : califica ? (
          <button className="op-btn pri" disabled={postulando} onClick={() => onPostular(proyecto.id)}>
            {postulando ? "Enviando…" : "Postularme al proyecto"}
          </button>
        ) : (
          <>
            <div className="op-meta" style={{ marginBottom: 7 }}>Para entrar te falta:</div>
            <div className="op-tags" style={{ marginBottom: 9 }}>
              {faltantes.map((f) => <span key={f} className="op-tag falta">{f}</span>)}
            </div>
            <button className="op-btn ghost" disabled title={`Te falta ${faltantes.join(", ")}`}>
              No cumples los requisitos todavía
            </button>
          </>
        )}
        </div>

        <button
          className={"op-corazon" + (favorito ? " on" : "")}
          onClick={() => onFavorito(proyecto.id)}
          aria-pressed={favorito}
          aria-label={favorito ? `Quitar ${proyecto.nombre} de favoritos` : `Guardar ${proyecto.nombre} en favoritos`}
          title={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <Heart size={17} fill={favorito ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}
