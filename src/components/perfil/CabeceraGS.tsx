/**
 * Cabecera de `/yo`: copia exacta de `profile-page.tsx` del componente de referencia — barra
 * superior, barra de título, hero con banner y la lista de cuatro accesos.
 *
 * Lo que cambia respecto al original es sólo el CONTENIDO, que sale del colaborador real en vez de
 * estar quemado ("Andres Amaya Bracho"): el marcado y las medidas son los mismos. Las dos únicas
 * decisiones tomadas aquí:
 *   - El avatar cae a las iniciales cuando el colaborador no tiene foto (todos los del seed), en vez
 *     de enseñar el retrato de archivo del mockup como si fuera su cara. La forma es idéntica.
 *   - El botón de menú abre el sidebar que ya tiene la aplicación, para no dejar un botón muerto.
 */
import type { ReactNode } from "react";
import {
  Bell, BriefcaseBusiness, ChevronRight, FileText, Menu, MoreHorizontal,
  Search, Target, UserRound,
} from "lucide-react";
import { iniciales } from "../../utils/format";
import { HeroPerfilGS, type Fuente } from "./HeroPerfilGS";
import type { Colaborador, Puesto } from "../../types/domain";

export interface AccesoPerfil {
  label: string;
  icon: typeof UserRound;
  onClick: () => void;
}

/** Los cuatro accesos del original, con sus etiquetas e iconos exactos. */
export const ACCESOS = [
  { label: "Actualiza tu información personal", icon: UserRound },
  { label: "Actualiza tu perfil profesional", icon: FileText },
  { label: "Información de empleo", icon: BriefcaseBusiness },
  { label: "Desempeño y objetivos", icon: Target },
] as const;

interface Props {
  yo: Colaborador;
  puesto?: Puesto;
  accesos: AccesoPerfil[];
  onMenu: () => void;
  onFuente: (f: Fuente) => void;
  cargandoFuente: Fuente | null;
  /** La barra de "perfil completo". Va ENTRE el hero y los accesos, que es donde se pidió. */
  barraCompletitud?: ReactNode;
}

export function CabeceraGS({
  yo, puesto, accesos, onMenu, onFuente, cargandoFuente, barraCompletitud,
}: Props) {
  return (
    <>
      <header className="gs-header">
        <div className="gs-header-izq">
          <button aria-label="Abrir menú" className="gs-icon-button" onClick={onMenu}>
            <Menu size={20} />
          </button>
          <div className="gs-marca">
            <div className="gs-logo"><span>GRUPO<br />SALINAS</span></div>
            <span className="gs-miperfil">Mi Perfil</span>
          </div>
        </div>
        <nav className="gs-nav" aria-label="Navegación superior">
          <button aria-label="Buscar" className="gs-icon-button"><Search size={18} /></button>
          <button aria-label="Notificaciones" className="gs-icon-button"><Bell size={18} /></button>
          {yo.foto
            ? <img src={yo.foto} alt={yo.nombre} className="gs-nav-avatar" />
            : <div className="gs-nav-avatar">{iniciales(yo.nombre)}</div>}
        </nav>
      </header>

      <section className="gs-titulo">
        <div className="gs-titulo-fila">
          <h1>Perfil de personas</h1>
          <button aria-label="Más opciones" className="gs-icon-button"><MoreHorizontal size={20} /></button>
        </div>
      </section>

      <HeroPerfilGS yo={yo} puesto={puesto} onFuente={onFuente} cargandoFuente={cargandoFuente} />

      {barraCompletitud}

      <section className="gs-lista">
        {accesos.map(({ label, icon: Icon, onClick }) => (
          <button key={label} className="gs-lista-item" onClick={onClick}>
            <Icon size={17} strokeWidth={1.7} className="gs-lista-icono" />
            <span>{label}</span>
            <ChevronRight size={16} className="gs-lista-chevron" />
          </button>
        ))}
      </section>
    </>
  );
}
