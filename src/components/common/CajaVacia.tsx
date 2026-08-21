/**
 * La ilustración de "aquí todavía no hay nada".
 *
 * Antes era un PNG servido desde un blob de Vercel ajeno al proyecto: pesaba, tardaba, y el día que
 * ese dominio dejara de responder los estados vacíos se quedaban con un icono roto. Ahora es SVG en
 * línea, así que viaja en el bundle, hereda la paleta con `currentColor` y no depende de nadie.
 *
 * La animación es la que da la pista de que la caja está VACÍA: las tres piezas salen de dentro y se
 * desvanecen hacia arriba. Se apaga entera con `prefers-reduced-motion`.
 */
export function CajaVacia() {
  return (
    <svg
      className="gs-caja"
      viewBox="0 0 96 68"
      fill="none"
      role="img"
      aria-label="Ilustración de una caja vacía"
    >
      {/* Las piezas que se escapan. El desfase las escalona sin necesitar tres animaciones. */}
      <g className="gs-caja-piezas">
        <rect x="41" y="20" width="8" height="8" rx="2" style={{ animationDelay: "0s" }} />
        <rect x="27" y="24" width="6" height="6" rx="2" style={{ animationDelay: ".9s" }} />
        <rect x="59" y="24" width="6" height="6" rx="2" style={{ animationDelay: "1.8s" }} />
      </g>

      {/* Solapas abiertas */}
      <path className="gs-caja-solapa" d="M24 40 L10 33 L24 26" />
      <path className="gs-caja-solapa" d="M72 40 L86 33 L72 26" />

      {/* Cuerpo */}
      <path className="gs-caja-cuerpo" d="M24 40 H72 L68 62 H28 Z" />
      {/* Boca: el rombo oscuro es lo que se lee como "está hueca". */}
      <path className="gs-caja-boca" d="M24 40 L48 33 L72 40 L48 47 Z" />
      <path className="gs-caja-linea" d="M48 47 V62" />
    </svg>
  );
}
