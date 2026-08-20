/**
 * Genera el camino del mapa.
 *
 * El componente original (`insumos/mapa-niveles.html`) trae un `<path>` dibujado a mano para 18
 * niveles sobre un lienzo fijo de 1400 px, y una lista `DECOR` con coordenadas absolutas. Aquí los
 * caminos miden entre 3 y 13 hitos: con pocos, medio lienzo quedaría vacío; con muchos, los nodos
 * se amontonarían.
 *
 * Por eso el trazo se GENERA, con la misma gramática de curvas del original: una serpentina que
 * alterna izquierda y derecha, sube ~107 px por tramo y termina arriba dejando sitio al castillo.
 * El camino sigue siendo la única fuente de verdad: todo lo demás (nodos, casas, decorado) se
 * coloca midiendo sobre él.
 */

export const ANCHO = 420;

/** Avance vertical por tramo. Sale del original: (1410 − 236) px ÷ 11 tramos ≈ 107. */
const PASO_Y = 107;
/** Aire por encima del último nodo, donde va el castillo. */
const AIRE_SUPERIOR = 210;
/** X de los vértices, alternando lado. El original oscila entre ~90 y ~336. */
const X_DERECHA = 322;
const X_IZQUIERDA = 104;
const X_INICIO = 235;

export interface Trazo {
  d: string;
  alto: number;
  tramos: number;
}

/** Cuántas curvas necesita un camino de `nNodos`. El original tiene ~1.6 nodos por tramo. */
function tramosPara(nNodos: number): number {
  return Math.max(3, Math.min(12, Math.round(nNodos / 1.6)));
}

export function construirTrazo(nNodos: number): Trazo {
  const tramos = tramosPara(nNodos);
  const alto = tramos * PASO_Y + AIRE_SUPERIOR;

  // El camino arranca por debajo del borde inferior, como en el original: da la sensación de que
  // viene de más atrás y no de que empieza justo ahí.
  let x = X_INICIO;
  let y = alto + 10;
  let d = `M ${x} ${y}`;

  for (let i = 1; i <= tramos; i++) {
    const xSiguiente = i % 2 === 1 ? X_DERECHA : X_IZQUIERDA;
    const ySiguiente = alto + 10 - i * PASO_Y;
    const dy = y - ySiguiente;
    // Curva en S: el primer control sale recto hacia arriba y el segundo entra recto al destino.
    d += ` C ${x} ${(y - dy * 0.55).toFixed(1)}, ${xSiguiente} ${(ySiguiente + dy * 0.55).toFixed(1)}, ${xSiguiente} ${ySiguiente}`;
    x = xSiguiente;
    y = ySiguiente;
  }

  return { d, alto, tramos };
}

/** Recorrido del camino que ocupan los nodos. Se deja aire al principio y al final. */
export const DESDE = 0.05;
export const HASTA = 0.93;

/** `t` de cada nodo, repartidos uniformemente. Con un solo hito se coloca a media altura. */
export function tDeNodos(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0.5];
  const paso = (HASTA - DESDE) / (n - 1);
  return Array.from({ length: n }, (_, i) => DESDE + i * paso);
}

/** Casas que crecen conforme avanzas: el progreso se lee sin mirar ningún número. */
export interface Casa { t: number; escala: number; lado: 1 | -1; alta: boolean; }

export function casasPara(tramos: number): Casa[] {
  const total = Math.max(2, Math.min(8, tramos));
  return Array.from({ length: total }, (_, i) => {
    const k = total === 1 ? 0 : i / (total - 1);
    return {
      t: 0.06 + k * (0.88 - 0.06),
      escala: 0.32 + k * (1.35 - 0.32),
      lado: (i % 2 ? 1 : -1) as 1 | -1,
      alta: i % 3 === 1,
    };
  });
}

/** Vegetación repartida sobre el camino. Determinista: mismo camino, mismo paisaje. */
export interface Adorno { t: number; lado: 1 | -1; tipo: "tree" | "bush" | "rock" | "sign"; escala: number; }

const TIPOS: Adorno["tipo"][] = ["tree", "bush", "rock", "tree", "sign", "bush", "rock", "tree"];

export function adornosPara(tramos: number): Adorno[] {
  const total = tramos * 2 + 2;
  return Array.from({ length: total }, (_, i) => ({
    t: 0.02 + (i / total) * 0.95,
    lado: (i % 2 ? -1 : 1) as 1 | -1,
    tipo: TIPOS[i % TIPOS.length],
    escala: 0.65 + ((i * 37) % 5) * 0.09,
  }));
}
