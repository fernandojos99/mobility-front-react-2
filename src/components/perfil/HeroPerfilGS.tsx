/**
 * El hero del perfil: banner, avatar superpuesto, identidad, navegación y fuentes.
 *
 * Es la parte central del componente `perfil-de-personas`, extraída para poder repetirla en las
 * cuatro pantallas del colaborador sin arrastrar la barra superior de Grupo Salinas.
 *
 * Debajo de la identidad va la **navegación en iconos**, que es la forma normal de moverse entre
 * pantallas. Vive aquí y no en cada página precisamente porque las cuatro comparten este hero. La
 * barra lateral sigue existiendo: es el único sitio con el selector de perfil de demo y el acceso a
 * la vista de generalista.
 */
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { FileUp, GraduationCap, Loader2, Pencil, X } from "lucide-react";
import { iniciales } from "../../utils/format";
import { NAV_COLABORADOR } from "../layout/navegacion";
import type { Colaborador, Puesto } from "../../types/domain";

/** URL del original, tal cual. */
const BANNER =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85";

/** Las fuentes con las que se puede rellenar el perfil de un tirón. */
export type Fuente = "cv" | "linkedin" | "lms";

/**
 * Logo de LinkedIn en SVG en línea. Lucide ya no trae iconos de marca, y el brief pide
 * expresamente que se vean los símbolos de cada fuente.
 */
const LogoLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const FUENTES: { fuente: Fuente; icono: ReactNode; texto: string }[] = [
  { fuente: "cv", icono: <FileUp size={14} />, texto: "Sube tu CV" },
  { fuente: "linkedin", icono: <LogoLinkedIn />, texto: "Conectar con LinkedIn" },
  { fuente: "lms", icono: <GraduationCap size={14} />, texto: "Importar de Universidad Grupo" },
];

interface Props {
  yo: Colaborador;
  puesto?: Puesto;
  /**
   * Sólo `/yo` sabe conectar con las fuentes. En las demás pantallas se omite y el botón de
   * "Actualiza tu perfil" no se pinta: un botón que no hace nada es peor que ninguno.
   */
  onFuente?: (f: Fuente) => void;
  cargandoFuente?: Fuente | null;
}

export function HeroPerfilGS({ yo, puesto, onFuente, cargandoFuente }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="gs-hero">
      <div className="gs-banner">
        <img src={BANNER} alt="Equipo colaborando en una oficina" />
        <div className="gs-banner-velo" />
        <div className="gs-banner-txt">
          <div className="gs-estrella">★</div>
          <div className="gs-talento">Talento <span>GS</span></div>
        </div>
      </div>

      <div className="gs-hero-cuerpo">
        <div className="gs-hero-fila">
          {yo.foto
            ? <img src={yo.foto} alt={yo.nombre} className="gs-avatar" />
            : <div className="gs-avatar">{iniciales(yo.nombre)}</div>}

          {onFuente && (
            <button className="gs-acciones-btn" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
              {abierto ? <X size={15} /> : <Pencil size={15} />} Actualiza tu perfil
            </button>
          )}
        </div>

        <div className="gs-identidad">
          {/* El número y el sello van en un bloque que no se parte: el ▣ solo en una línea se lee
              como un error de maquetación. En el original no pasa porque cortan el nombre a mano. */}
          <h2 className="gs-nombre">
            {yo.nombre}{" "}
            <span className="gs-sello">
              <span className="gs-num">({String(yo.id).padStart(8, "0")})</span>{" "}
              <span className="gs-verificado" aria-label="Perfil verificado">▣</span>
            </span>
          </h2>
          <div className="gs-cargo">
            <p>{puesto?.titulo ?? "Puesto sin asignar"} ({yo.puestoActualId})</p>
            <p>{yo.area}{yo.departamento && yo.departamento !== yo.area ? ` · ${yo.departamento}` : ""}</p>
          </div>
        </div>

        {onFuente && abierto && (
          <div>
            <div className="gs-fuentes">
              {FUENTES.map(({ fuente, icono, texto }) => (
                <button
                  key={fuente}
                  className="gs-fuente-btn"
                  disabled={cargandoFuente != null}
                  onClick={() => onFuente(fuente)}
                >
                  {cargandoFuente === fuente
                    ? <><Loader2 size={14} className="girando" /> {fuente === "cv" ? "Analizando…" : "Importando…"}</>
                    : <>{icono} {texto}</>}
                </button>
              ))}
            </div>
            <p className="gs-fuentes-nota">Los datos cargados vienen de GS.</p>
          </div>
        )}

        <nav className="gs-nav-perfil" aria-label="Secciones de mi perfil">
          {NAV_COLABORADOR.map(({ to, icon: Icon, corto, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/yo"}
              className={({ isActive }) => (isActive ? "activo" : "")}
              aria-label={label}
            >
              <i><Icon size={19} strokeWidth={1.8} /></i>
              <span>{corto}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </section>
  );
}
