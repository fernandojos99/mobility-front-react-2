/**
 * Serie del IPN por trimestre.
 *
 * El original traía una `polyline` con cuatro pares de coordenadas escritos a mano, así que sólo
 * servía para esos cuatro valores. Aquí la geometría se calcula: funciona con los puntos que haya.
 *
 * Decisiones de la gráfica (skill `dataviz`):
 *   - Serie única → NO lleva leyenda; el título de la tarjeta ya la nombra.
 *   - No se rotula cada punto. Los valores van bajo la gráfica, y esa fila hace de tabla accesible.
 *   - Línea de 2px, marca de 8px con anillo de superficie para que no se funda con la línea.
 *   - Rejilla recesiva, y el eje Y arranca por debajo del mínimo pero NO en cero: el IPN es un
 *     índice que se mueve en una banda estrecha, y forzar el cero aplanaría la serie.
 *   - Capa de hover con cruz y globo, que es lo que se espera de una gráfica en HTML.
 */
import { useState } from "react";
import type { PuntoIpn } from "../../types/domain";

const AN = 360;
const AL = 140;
const M = { arriba: 14, derecha: 14, abajo: 22, izquierda: 34 };

interface Props {
  puntos: PuntoIpn[];
}

export function GraficaIpn({ puntos }: Props) {
  const [activo, setActivo] = useState<number | null>(null);
  if (puntos.length === 0) return null;

  const valores = puntos.map((p) => p.valor);
  // Banda con holgura, redondeada a múltiplos de 5 para que las guías caigan en números legibles.
  const min = Math.max(0, Math.floor((Math.min(...valores) - 6) / 5) * 5);
  const max = Math.min(100, Math.ceil((Math.max(...valores) + 6) / 5) * 5);
  const rango = max - min || 1;

  const anchoUtil = AN - M.izquierda - M.derecha;
  const altoUtil = AL - M.arriba - M.abajo;
  const x = (i: number): number =>
    M.izquierda + (puntos.length === 1 ? anchoUtil / 2 : (anchoUtil * i) / (puntos.length - 1));
  const y = (v: number): number => M.arriba + altoUtil - ((v - min) / rango) * altoUtil;

  const guias = [min, min + rango / 2, max];
  const linea = puntos.map((p, i) => `${x(i)},${y(p.valor)}`).join(" ");
  const sel = activo === null ? null : puntos[activo];

  return (
    <div className="tl-gr">
      <svg
        viewBox={`0 0 ${AN} ${AL}`}
        role="img"
        aria-label={`Evolución del IPN: ${puntos.map((p) => `${p.periodo} ${p.valor}%`).join(", ")}`}
        onMouseLeave={() => setActivo(null)}
      >
        {guias.map((g) => (
          <g key={g}>
            <line className="tl-gr-rejilla" x1={M.izquierda} x2={AN - M.derecha} y1={y(g)} y2={y(g)} />
            <text className="tl-gr-eje" x={M.izquierda - 7} y={y(g) + 3} textAnchor="end">
              {Math.round(g)}%
            </text>
          </g>
        ))}

        {sel && activo !== null && (
          <line className="tl-gr-cruz" x1={x(activo)} x2={x(activo)} y1={M.arriba} y2={AL - M.abajo} />
        )}

        <polyline className="tl-gr-linea" points={linea} />

        {puntos.map((p, i) => (
          <circle key={p.periodo} className={"tl-gr-punto" + (activo === i ? " on" : "")}
            cx={x(i)} cy={y(p.valor)} r={4} />
        ))}

        {puntos.map((p, i) => (
          <text key={p.periodo + "-eje"} className="tl-gr-eje" x={x(i)} y={AL - 6} textAnchor="middle">
            {p.periodo.split(" ")[0]}
          </text>
        ))}

        {/* Zonas de golpeo anchas: la marca mide 8px y con el dedo eso no se acierta. */}
        {puntos.map((p, i) => (
          <rect key={p.periodo + "-hit"} className="tl-gr-golpe"
            x={x(i) - anchoUtil / (puntos.length * 2) - 4} y={0}
            width={anchoUtil / puntos.length + 8} height={AL}
            onMouseEnter={() => setActivo(i)}
            onClick={() => setActivo(activo === i ? null : i)} />
        ))}
      </svg>

      {sel && activo !== null && (
        <div className="tl-globo" style={{ left: `${(x(activo) / AN) * 100}%`, top: `${(y(sel.valor) / AL) * 100}%` }}>
          <b>{sel.valor}%</b>{sel.periodo}
        </div>
      )}

      <div className="tl-gr-val">
        {puntos.map((p) => (
          <span key={p.periodo}>{p.valor}%<small>{p.periodo}</small></span>
        ))}
      </div>
    </div>
  );
}
