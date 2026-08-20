/**
 * Recomendaciones del sistema para el puesto actual.
 *
 * El índigo NO se negocia: es la convención del proyecto —si es índigo, lo sugirió el sistema— y en
 * cuanto aparece en otro sitio deja de significar nada. Lo que cambió es la forma. Antes era un
 * bloque con viñetas «→» donde todos los consejos pesaban igual; ahora cada uno es una fila
 * numerada con la ACCIÓN en negrita y el detalle debajo, que es como se lee una lista de tareas.
 *
 * Las sugerencias llegan de `GET /colaboradores/:id/gap`. Están simuladas y son deterministas: se
 * derivan de lo que le falta al colaborador, no de un modelo.
 */
import { Sparkles } from "lucide-react";

/**
 * Parte un consejo en titular y detalle.
 *
 * Los del backend vienen en dos formas: con un título entrecomillado y su letra pequeña entre
 * paréntesis —«Excel avanzado» (Universidad Grupo, 20 h)— o como una frase con dos puntos. Si no es
 * ninguna de las dos, se deja entero como titular en vez de cortarlo por donde no toca.
 */
function partir(consejo: string): { titular: string; detalle: string } {
  const comillas = /^(.*?«[^»]+»)\s*(.*)$/.exec(consejo);
  if (comillas && comillas[2]) {
    return { titular: comillas[1], detalle: comillas[2].replace(/^[:\s]+/, "") };
  }
  const dosPuntos = /^([^:]{8,}?):\s+(.+)$/.exec(consejo);
  if (dosPuntos) return { titular: dosPuntos[1], detalle: dosPuntos[2] };
  return { titular: consejo, detalle: "" };
}

export function RecomendacionIA({ sugerencias }: { sugerencias: string[] }) {
  if (sugerencias.length === 0) return null;

  return (
    <section className="gs-card tl-ia" style={{ margin: 0 }}>
      <div className="tl-tit">
        <span className="tl-icono"><Sparkles size={16} strokeWidth={2.5} /></span>
        <h3>Qué puedes hacer para mejorar</h3>
        <span className="tl-ia-etiqueta">Sugerido por IA</span>
      </div>

      {sugerencias.map((s, i) => {
        const { titular, detalle } = partir(s);
        return (
          <div className="tl-ia-fila" key={s}>
            <span className="tl-ia-num">{i + 1}</span>
            <p className="tl-ia-txt">
              <b>{titular}</b>
              {detalle && <span>{detalle}</span>}
            </p>
          </div>
        );
      })}

      <p className="tl-ia-pie">
        Se calculan a partir de lo que te falta para el descriptivo de tu puesto. Cambian solas
        cuando actualizas tu perfil.
      </p>
    </section>
  );
}
