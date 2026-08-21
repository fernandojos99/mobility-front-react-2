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
import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { CheckCircle2, FileUp, Loader2, Pencil, PencilLine, ShieldCheck, X } from "lucide-react";
import { iniciales } from "../../utils/format";
import { Modal } from "../common/Modal";
import { NAV_COLABORADOR } from "../layout/navegacion";
import type { Colaborador, Puesto } from "../../types/domain";

/** URL del original, tal cual. */
const BANNER =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85";

/** Las fuentes con las que se puede rellenar el perfil de un tirón. */
export type Fuente = "cv" | "linkedin";

/**
 * Logo de LinkedIn en SVG en línea. Lucide ya no trae iconos de marca, y el brief pide
 * expresamente que se vean los símbolos de cada fuente.
 */
const LogoLinkedIn = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

/**
 * Código de cinco dígitos, como los del mockup original ("(5314249)").
 *
 * Es un identificador de nómina: sale del texto de forma determinista, así que el mismo puesto
 * enseña siempre el mismo número. No representa nada de un sistema real.
 */
function codigo(texto: string): string {
  let n = 0;
  for (const ch of texto) n = (n * 31 + ch.charCodeAt(0)) % 90000;
  return String(10000 + n).slice(0, 5);
}

interface Props {
  yo: Colaborador;
  puesto?: Puesto;
  /**
   * Sólo `/yo` sabe conectar con las fuentes. En las demás pantallas se omite y el botón de
   * "Actualiza tu perfil" no se pinta: un botón que no hace nada es peor que ninguno.
   */
  onFuente?: (f: Fuente) => void;
  cargandoFuente?: Fuente | null;
  /** "Agregar Manual": cierra el panel y baja a los formularios de la página. */
  onManual?: () => void;
}

export function HeroPerfilGS({ yo, puesto, onFuente, cargandoFuente, onManual }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [linkedin, setLinkedin] = useState(false);
  const [archivo, setArchivo] = useState("");
  const inputArchivo = useRef<HTMLInputElement>(null);

  /** El CV abre el explorador de archivos de verdad; lo que se simula es el análisis, no la elección. */
  function elegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivo(f.name);
    onFuente?.("cv");
    e.target.value = "";
  }

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
          <h2 className="gs-nombre">
            {yo.nombre} <span className="gs-num">({String(yo.id).padStart(8, "0")})</span>
          </h2>
          <div className="gs-cargo">
            <p>{puesto?.titulo ?? "Puesto sin asignar"} <span>({codigo(yo.puestoActualId)})</span></p>
            <p>{yo.departamento ?? yo.area} <span>({codigo(yo.area)})</span></p>
          </div>
        </div>

        {/* Caja destacada: las fuentes son la vía rápida, y tienen que verse como tal. */}
        {onFuente && abierto && (
          <div className="gs-fuentes-caja">
            <p className="gs-fuentes-tit">¿Cómo quieres llenarlo?</p>
            <div className="gs-fuentes">
              <button
                className="gs-fuente-btn"
                disabled={cargandoFuente != null}
                onClick={() => inputArchivo.current?.click()}
              >
                {cargandoFuente === "cv"
                  ? <><Loader2 size={14} className="girando" /> Analizando tu CV…</>
                  : <><FileUp size={14} /> Sube tu CV</>}
              </button>

              <button
                className="gs-fuente-btn"
                disabled={cargandoFuente != null}
                onClick={() => setLinkedin(true)}
              >
                {cargandoFuente === "linkedin"
                  ? <><Loader2 size={14} className="girando" /> Conectando…</>
                  : <><LogoLinkedIn /> Conectar con LinkedIn</>}
              </button>

              <button
                className="gs-fuente-btn"
                disabled={cargandoFuente != null}
                onClick={() => { setAbierto(false); onManual?.(); }}
              >
                <PencilLine size={14} /> Agregar Manual
              </button>
            </div>

            {archivo && <p className="gs-fuentes-nota">Archivo elegido: <b>{archivo}</b></p>}
            <p className="gs-fuentes-nota">Los datos cargados vienen de GS.</p>

            {/* Oculto: el botón de arriba es quien lo dispara. */}
            <input
              ref={inputArchivo}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={elegirArchivo}
              style={{ display: "none" }}
              aria-hidden="true"
              tabIndex={-1}
            />
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

      {linkedin && (
        <Modal onClose={() => setLinkedin(false)}>
          <div className="gs-li">
            <div className="gs-li-logo"><LogoLinkedIn size={26} /></div>
            <h3>Conectar con LinkedIn</h3>
            <p>Vas a permitir que Mapa de Carrera lea de tu perfil público:</p>
            <ul>
              <li><CheckCircle2 size={14} /> Tu experiencia laboral y tu formación</li>
              <li><CheckCircle2 size={14} /> Las aptitudes que tengas validadas</li>
              <li><CheckCircle2 size={14} /> Tu titular y tu resumen profesional</li>
            </ul>
            <p className="gs-li-aviso">
              <ShieldCheck size={13} /> No se publica nada en tu nombre y puedes desconectarlo cuando
              quieras.
            </p>
            <div className="gs-li-pie">
              <button className="gs-li-ok" onClick={() => { setLinkedin(false); onFuente?.("linkedin"); }}>
                Autorizar y continuar
              </button>
              <button className="gs-li-no" onClick={() => setLinkedin(false)}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
