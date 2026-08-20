/**
 * Los `<defs>` del mapa, portados desde `insumos/mapa-niveles.html` sin cambiarles un punto.
 *
 * Cada figura tiene su origen en la BASE y al centro, con proyección isométrica: por eso se pueden
 * colocar con un simple `translate(x y) scale(s)` sobre cualquier punto del camino y "se apoyan"
 * en el suelo solas.
 */
interface Props { idPrefijo: string; }

export function DefsMapa({ idPrefijo }: Props) {
  return (
    <defs>
      <pattern id={`${idPrefijo}-pasto`} width="140" height="140" patternUnits="userSpaceOnUse">
        <rect width="140" height="140" fill="#6dbe45" />
        <ellipse cx="34" cy="28" rx="30" ry="13" fill="#7fcc52" />
        <ellipse cx="112" cy="82" rx="34" ry="15" fill="#5aa838" />
        <ellipse cx="20" cy="112" rx="22" ry="9" fill="#7fcc52" />
        <ellipse cx="86" cy="10" rx="18" ry="7" fill="#5aa838" />
      </pattern>

      {/* Oscurecimiento inferior: hunde el borde de abajo y da profundidad a la escena. */}
      <linearGradient id={`${idPrefijo}-hondo`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.72" stopColor="#123a08" stopOpacity="0" />
        <stop offset="1" stopColor="#123a08" stopOpacity=".28" />
      </linearGradient>

      {/* ── Casa (origen = base al centro) ── */}
      <g id={`${idPrefijo}-casa`}>
        <ellipse cx="2" cy="2" rx="52" ry="13" fill="#000" opacity=".16" />
        <path d="M-32 0 L-32 -44 L10 -44 L10 0 Z" fill="#fff1d6" />
        <path d="M10 0 L10 -44 L32 -56 L32 -12 Z" fill="#e3cba1" />
        <path d="M14 -44 L-11 -64 L11 -76 L36 -56 Z" fill="#c73f36" />
        <path d="M-36 -44 L-11 -64 L14 -44 Z" fill="#e8574a" />
        <path d="M-24 0 L-24 -20 A7 7 0 0 1 -10 -20 L-10 0 Z" fill="#a9743d" />
        <circle cx="-12" cy="-11" r="1.6" fill="#ffd23d" />
        <rect x="-4" y="-34" width="11" height="11" rx="2" fill="#84d4f5" stroke="#fff1d6" strokeWidth="2" />
        <path d="M14 -47 L-13 -68" stroke="#a12f28" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── Casa alta (variante) ── */}
      <g id={`${idPrefijo}-casa2`}>
        <ellipse cx="2" cy="2" rx="46" ry="12" fill="#000" opacity=".16" />
        <path d="M-26 0 L-26 -62 L6 -62 L6 0 Z" fill="#eaf3ff" />
        <path d="M6 0 L6 -62 L26 -73 L26 -11 Z" fill="#cbd9ea" />
        <path d="M10 -62 L-10 -80 L10 -91 L30 -73 Z" fill="#2f7fbf" />
        <path d="M-30 -62 L-10 -80 L10 -62 Z" fill="#3f9ade" />
        <path d="M-19 0 L-19 -18 A6 6 0 0 1 -7 -18 L-7 0 Z" fill="#a9743d" />
        <rect x="-20" y="-52" width="10" height="10" rx="2" fill="#84d4f5" stroke="#eaf3ff" strokeWidth="2" />
        <rect x="-4" y="-52" width="10" height="10" rx="2" fill="#84d4f5" stroke="#eaf3ff" strokeWidth="2" />
        <rect x="-20" y="-36" width="10" height="10" rx="2" fill="#84d4f5" stroke="#eaf3ff" strokeWidth="2" />
        <rect x="-4" y="-36" width="10" height="10" rx="2" fill="#84d4f5" stroke="#eaf3ff" strokeWidth="2" />
      </g>

      {/* ── Castillo: la meta. Aquí es el PUESTO OBJETIVO. ── */}
      <g id={`${idPrefijo}-castillo`}>
        <ellipse cx="6" cy="4" rx="122" ry="28" fill="#000" opacity=".18" />
        <path d="M-58 0 L-58 -92 L28 -92 L28 0 Z" fill="#f3e6cd" />
        <path d="M28 0 L28 -92 L58 -110 L58 -18 Z" fill="#d8c5a4" />
        <g fill="#e6d5b6">
          <rect x="-58" y="-104" width="18" height="14" />
          <rect x="-32" y="-104" width="18" height="14" />
          <rect x="-6" y="-104" width="18" height="14" />
          <rect x="20" y="-104" width="8" height="14" />
        </g>
        <path d="M28 -104 L28 -90 L58 -108 L58 -122 Z" fill="#c9b492" />
        <path d="M-30 0 L-30 -40 A16 16 0 0 1 2 -40 L2 0 Z" fill="#8c5a2b" />
        <path d="M-24 0 L-24 -38 A10 10 0 0 1 -4 -38 L-4 0 Z" fill="#b07a3d" />
        <circle cx="-8" cy="-20" r="2.5" fill="#ffd23d" />
        <path d="M-44 -60 L-44 -74 A6 6 0 0 1 -32 -74 L-32 -60 Z" fill="#3f6f9e" />
        <path d="M8 -60 L8 -74 A6 6 0 0 1 20 -74 L20 -60 Z" fill="#3f6f9e" />
        <path d="M-96 0 L-96 -120 L-60 -120 L-60 0 Z" fill="#f3e6cd" />
        <path d="M-102 -120 L-54 -120 L-54 -132 L-102 -132 Z" fill="#e6d5b6" />
        <path d="M-104 -132 L-78 -186 L-52 -132 Z" fill="#e8574a" />
        <path d="M-88 -70 L-88 -84 A6 6 0 0 1 -76 -84 L-76 -70 Z" fill="#3f6f9e" />
        <path d="M-78 -186 L-78 -206" stroke="#8c5a2b" strokeWidth="4" strokeLinecap="round" />
        <path d="M-78 -204 L-46 -196 L-78 -188 Z" fill="#ffd23d" />
        <path d="M30 0 L30 -120 L66 -120 L66 0 Z" fill="#eaddc3" />
        <path d="M24 -120 L72 -120 L72 -132 L24 -132 Z" fill="#dccba9" />
        <path d="M22 -132 L48 -186 L74 -132 Z" fill="#c73f36" />
        <path d="M42 -70 L42 -84 A6 6 0 0 1 54 -84 L54 -70 Z" fill="#3f6f9e" />
        <path d="M48 -186 L48 -206" stroke="#8c5a2b" strokeWidth="4" strokeLinecap="round" />
        <path d="M48 -204 L80 -196 L48 -188 Z" fill="#ffd23d" />
      </g>

      {/* ── Vegetación ── */}
      <g id={`${idPrefijo}-tree`}>
        <ellipse cx="0" cy="4" rx="27" ry="8" fill="#000" opacity=".16" />
        <path d="M-6 4 L-4 2 L4 2 L6 4Z" fill="#8c5a2b" />
        <path d="M-5 4 L-4 -8 L4 -8 L5 4Z" fill="#c9a06a" />
        <circle cx="0" cy="-26" r="24" fill="#2f8f3e" />
        <circle cx="-17" cy="-12" r="17" fill="#3aa04a" />
        <circle cx="17" cy="-14" r="16" fill="#268335" />
        <circle cx="-7" cy="-37" r="14" fill="#46b357" />
        <ellipse cx="-8" cy="-36" rx="7" ry="5" fill="#5cc46b" opacity=".8" />
      </g>
      <g id={`${idPrefijo}-bush`}>
        <ellipse cx="0" cy="10" rx="24" ry="6" fill="#000" opacity=".14" />
        <circle cx="-13" cy="0" r="12" fill="#3aa04a" />
        <circle cx="12" cy="1" r="11" fill="#2f8f3e" />
        <circle cx="0" cy="-8" r="15" fill="#46b357" />
        <ellipse cx="-2" cy="-14" rx="7" ry="4" fill="#5cc46b" opacity=".8" />
      </g>
      <g id={`${idPrefijo}-rock`}>
        <ellipse cx="0" cy="12" rx="26" ry="6" fill="#000" opacity=".14" />
        <path d="M-24 12 L-14 -10 L4 -16 L20 -4 L24 12Z" fill="#9fb0b8" />
        <path d="M-14 -10 L4 -16 L6 -2 L-6 2Z" fill="#c9d6dc" />
      </g>
      <g id={`${idPrefijo}-sign`}>
        <ellipse cx="0" cy="26" rx="18" ry="5" fill="#000" opacity=".16" />
        <rect x="-4" y="-6" width="8" height="32" fill="#a9743d" />
        <path d="M-26 -26 H16 L28 -14 L16 -2 H-26Z" fill="#d69a52" stroke="#a9743d" strokeWidth="4" strokeLinejoin="round" />
      </g>
    </defs>
  );
}
