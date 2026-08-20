/**
 * Un nodo del mapa. Es un `Hito`, que es a la vez una fila del GAP.
 *
 * Tres estados, exactamente los del componente original:
 *   cumplido  → estrella dorada
 *   actual    → número dentro del círculo, con un anillo que pulsa
 *   bloqueado → candado gris
 *
 * Accesibilidad: cada nodo es un botón real con `aria-label` en lenguaje de dominio
 * ("Excel avanzado — bloqueado"), no "Nivel 7".
 */
import type { Hito } from "../../types/domain";

interface Props {
  hito: Hito;
  indice: number;
  x: number;
  y: number;
  onAbrir: (hito: Hito) => void;
}

/** Estrella de 5 puntas, portada del original. */
function pathEstrella(R: number, r: number): string {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += (i ? "L" : "M") + (rad * Math.cos(a)).toFixed(2) + " " + (rad * Math.sin(a)).toFixed(2);
  }
  return d + "Z";
}

const ETIQUETA_ESTADO: Record<Hito["estado"], string> = {
  cumplido: "cumplido",
  actual: "es tu siguiente paso",
  bloqueado: "bloqueado",
};

export function NodoHito({ hito, indice, x, y, onAbrir }: Props) {
  const bloqueado = hito.estado === "bloqueado";
  const profundo = bloqueado ? "#6c7a83" : "#9c1c15";
  const cara = bloqueado ? "#9aa7b0" : "#e8392e";

  return (
    <g
      className="nodo"
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
      tabIndex={0}
      role="button"
      aria-label={`${hito.titulo} — ${ETIQUETA_ESTADO[hito.estado]}`}
      onClick={() => onAbrir(hito)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onAbrir(hito);
      }}
    >
      <g className="cuerpo">
        {hito.estado === "actual" && <circle className="pulso" r={30} />}
        <ellipse cx={0} cy={16} rx={24} ry={7} fill="#000" opacity=".22" />
        {/* Canto inferior: es lo que le da volumen al disco sin motor 3D. */}
        <circle cy={7} r={25} fill={profundo} />
        <circle className="aro" r={25} fill="#fff" />
        <circle r={19} fill={cara} />
        <path d="M-19 -6 A19 19 0 0 1 19 -6 A19 12 0 0 0 -19 -6 Z" fill="#fff" opacity=".25" />

        {hito.estado === "bloqueado" && (
          <g fill="#fff" transform="translate(0 1)">
            <path d="M-6 -4 A6 6 0 0 1 6 -4 L6 0 L3 0 L3 -4 A3 3 0 0 0 -3 -4 L-3 0 L-6 0 Z" />
            <rect x={-8} y={-1} width={16} height={13} rx={3} />
          </g>
        )}
        {hito.estado === "actual" && <text y={7}>{indice + 1}</text>}
        {hito.estado === "cumplido" && (
          <path d={pathEstrella(14, 6)} fill="#ffd23d" stroke="#eda200" strokeWidth={2} strokeLinejoin="round" />
        )}
      </g>
    </g>
  );
}
