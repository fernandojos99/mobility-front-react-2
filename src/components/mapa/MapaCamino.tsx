/**
 * El mapa del camino. Port a React del componente de `insumos/mapa-niveles.html`.
 *
 * Tres cosas del original que se conservan porque son las que lo hacen funcionar:
 *
 *  1. EL CAMINO ES UN SOLO `<path>`, dibujado cuatro veces con `<use>`: una copia oscura
 *     desplazada en Y (el canto del terreno), el borde, la superficie y la línea punteada. Eso da
 *     volumen sin motor 3D.
 *  2. TODO SE MIDE SOBRE LA CURVA con `getPointAtLength()` y con su NORMAL, nunca con coordenadas
 *     sueltas. Cambia el trazo y la escena entera se recoloca sola.
 *  3. ALGORITMO DEL PINTOR: lo que está sobre el pasto se ordena por Y antes de dibujarse, así lo
 *     de abajo tapa lo de arriba y la escena se lee con profundidad.
 *
 * Dos cosas que SÍ cambian respecto al original:
 *  - El trazo se genera (ver `trazo.ts`), porque los caminos aquí no miden siempre lo mismo.
 *  - No se muta el DOM con `createElementNS`: se mide en `useLayoutEffect` y se devuelve JSX. Si se
 *    copiara el `el()`/`use()` del original, React y el script se pelearían por el mismo nodo.
 */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NodoHito } from "./NodoHito";
import { HojaHito } from "./HojaHito";
import { DefsMapa } from "./DefsMapa";
import { ANCHO, adornosPara, casasPara, construirTrazo, tDeNodos } from "./trazo";
import type { Hito } from "../../types/domain";
import "./mapa.css";

interface Props {
  hitos: Hito[];
  /** Título del puesto objetivo: es lo que hay dentro del castillo. */
  objetivo: string;
  avance: number;
}

interface Punto { x: number; y: number; }
interface Pieza { y: number; clave: string; href: string; x: number; escala: number; }

export function MapaCamino({ hitos, objetivo, avance }: Props) {
  const idPrefijo = useId().replace(/:/g, "");
  const caminoRef = useRef<SVGPathElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const [nodos, setNodos] = useState<Punto[]>([]);
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [abierto, setAbierto] = useState<Hito | null>(null);

  const trazo = useMemo(() => construirTrazo(hitos.length), [hitos.length]);
  const indiceActual = hitos.findIndex((h) => h.estado === "actual");

  // `getPointAtLength` exige el path YA montado en el DOM, así que no se puede calcular durante el
  // render. Y se mide en useLayoutEffect, no en useEffect, para que el navegador no llegue a pintar
  // los nodos en (0,0) antes de colocarlos.
  useLayoutEffect(() => {
    const camino = caminoRef.current;
    if (!camino) return;

    const LARGO = camino.getTotalLength();
    const en = (t: number): Punto => {
      const p = camino.getPointAtLength(LARGO * Math.min(1, Math.max(0, t)));
      return { x: p.x, y: p.y };
    };

    /** Punto desplazado sobre la NORMAL de la curva: separa las casas del camino sin pisarlo. */
    const alLado = (t: number, dist: number): Punto => {
      const p = en(t);
      const a = en(t - 0.004);
      const b = en(t + 0.004);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const L = Math.hypot(dx, dy) || 1;
      return { x: p.x + (-dy / L) * dist, y: p.y + (dx / L) * dist };
    };

    setNodos(tDeNodos(hitos.length).map(en));

    // ── Casas que crecen conforme avanzas ──
    const escena: Pieza[] = [];
    const ocupado: { x: number; y: number; r: number }[] = [];

    casasPara(trazo.tramos).forEach((casa, i) => {
      const dist = 62 + casa.escala * 34;
      let lado = casa.lado;
      let p = alLado(casa.t, dist * lado);
      // Si la casa se sale del lienzo, se pasa al otro lado del camino.
      if (p.x < 70 || p.x > 350) {
        lado = (lado * -1) as 1 | -1;
        p = alLado(casa.t, dist * lado);
      }
      p.x = Math.min(352, Math.max(68, p.x));
      escena.push({
        y: p.y, clave: `casa-${i}`, x: p.x, escala: casa.escala,
        href: `#${idPrefijo}-${casa.alta ? "casa2" : "casa"}`,
      });
      ocupado.push({ x: p.x, y: p.y, r: 60 * casa.escala + 30 });
    });

    // ── El castillo: el puesto objetivo, al final del camino ──
    const meta = en(1);
    escena.push({ y: meta.y - 6, clave: "castillo", x: meta.x + 4, escala: 1, href: `#${idPrefijo}-castillo` });
    ocupado.push({ x: meta.x, y: meta.y - 14, r: 150 });

    // ── Vegetación: se salta lo que choque con una casa o con el castillo ──
    adornosPara(trazo.tramos).forEach((adorno, i) => {
      const p = alLado(adorno.t, (95 + adorno.escala * 40) * adorno.lado);
      if (p.x < 30 || p.x > 392) return;
      if (ocupado.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < o.r)) return;
      escena.push({ y: p.y, clave: `adorno-${i}`, x: p.x, escala: adorno.escala, href: `#${idPrefijo}-${adorno.tipo}` });
    });

    // Algoritmo del pintor: lo de abajo se dibuja encima.
    escena.sort((a, b) => a.y - b.y);
    setPiezas(escena);
  }, [hitos.length, trazo, idPrefijo]);

  // Cámara: al montar, el nodo actual queda a media altura. Sin esto, un camino largo abre por
  // arriba (el castillo) y el colaborador no ve dónde está.
  useEffect(() => {
    const escena = escenaRef.current;
    if (!escena || !nodos.length) return;
    const i = indiceActual >= 0 ? indiceActual : nodos.length - 1;
    const p = nodos[i];
    if (!p) return;
    const proporcion = escena.scrollHeight / trazo.alto;
    escena.scrollTop = Math.max(0, p.y * proporcion - escena.clientHeight * 0.58);
  }, [nodos, indiceActual, trazo.alto]);

  const idCamino = `${idPrefijo}-camino`;

  return (
    <div className="mapa">
      <div className="mapa-barra">
        <b>{avance}%</b> del camino a {objetivo}
      </div>

      <div className="mapa-escena" ref={escenaRef}>
        <svg viewBox={`0 0 ${ANCHO} ${trazo.alto}`} xmlns="http://www.w3.org/2000/svg"
          role="img" aria-label={`Mapa del camino hacia ${objetivo}. ${avance} por ciento recorrido.`}>
          <DefsMapa idPrefijo={idPrefijo} />
          {/*
            El camino vive en <defs>: no se pinta aquí, se pinta cuatro veces más abajo con <use>.
            Va en defs y no con `display:none` porque un elemento oculto puede devolver longitud 0
            en algunos navegadores, y todas las posiciones del mapa dependen de esa medida.
          */}
          <defs>
            <path ref={caminoRef} id={idCamino} d={trazo.d} fill="none" />
          </defs>

          <rect width={ANCHO} height={trazo.alto} fill={`url(#${idPrefijo}-pasto)`} />

          {/* Lomas suaves: dan relieve al terreno y rompen la textura plana del pasto. */}
          <g opacity=".5">
            {Array.from({ length: trazo.tramos }, (_, i) => (
              <ellipse key={i}
                cx={i % 2 ? 380 : 60}
                cy={trazo.alto - 120 - i * 214}
                rx={i % 2 ? 140 : 152} ry={i % 2 ? 65 : 72}
                fill={i % 2 ? "#5aa838" : "#7fcc52"} />
            ))}
          </g>

          <g>{piezas.map((p) => (
            <use key={p.clave} href={p.href}
              transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.escala})`} />
          ))}</g>

          {/* El camino, cuatro veces: canto, borde, superficie y línea punteada. */}
          <use href={`#${idCamino}`} className="via-canto" transform="translate(0 15)" />
          <use href={`#${idCamino}`} className="via-borde" />
          <use href={`#${idCamino}`} className="via-cara" />
          <use href={`#${idCamino}`} className="via-raya" />

          <g>{nodos.map((p, i) => (
            <NodoHito key={hitos[i].id} hito={hitos[i]} indice={i} x={p.x} y={p.y} onAbrir={setAbierto} />
          ))}</g>

          {/* El avatar, sobre el nodo actual. Sin pointer-events: los clics son de los nodos. */}
          {indiceActual >= 0 && nodos[indiceActual] && (
            <Avatar x={nodos[indiceActual].x} y={nodos[indiceActual].y - 30} />
          )}

          <rect width={ANCHO} height={trazo.alto} fill={`url(#${idPrefijo}-hondo)`} pointerEvents="none" />
        </svg>
      </div>

      <HojaHito hito={abierto} hitos={hitos} onCerrar={() => setAbierto(null)} />
    </div>
  );
}

/** El muñeco amarillo que salta sobre el nodo actual. Portado del original. */
function Avatar({ x, y }: Punto) {
  return (
    <g className="avatar-mapa" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <ellipse cx={0} cy={30} rx={17} ry={5} fill="#000" opacity=".25" />
      <g className="salto">
        <ellipse cx={-8} cy={26} rx={7} ry={4} fill="#e07d00" />
        <ellipse cx={8} cy={26} rx={7} ry={4} fill="#e07d00" />
        <circle cy={5} r={20} fill="#f5b400" />
        <circle cy={2} r={20} fill="#ffd23d" stroke="#e0a000" strokeWidth={2} />
        <path d="M-18 -4 A18 18 0 0 1 18 -4 A18 11 0 0 0 -18 -4 Z" fill="#fff" opacity=".35" />
        <ellipse cx={-6} cy={-1} rx={4.5} ry={5.5} fill="#fff" />
        <ellipse cx={7} cy={-1} rx={4.5} ry={5.5} fill="#fff" />
        <circle cx={-5} cy={0} r={2.4} fill="#33240a" />
        <circle cx={8} cy={0} r={2.4} fill="#33240a" />
        <path d="M-6 9 Q1 15 8 9" fill="none" stroke="#33240a" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={-13} cy={8} r={3} fill="#ff9e7a" opacity=".75" />
        <circle cx={15} cy={8} r={3} fill="#ff9e7a" opacity=".75" />
      </g>
    </g>
  );
}
