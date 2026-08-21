/**
 * Cabecera de `/yo`: barra superior, barra de título, hero y los accesos plegables.
 *
 * El marcado y las medidas son los del componente de referencia `profile-page.tsx`. Lo que cambia
 * es el CONTENIDO —sale del colaborador real— y que **los accesos ahora se despliegan**: cada uno
 * guarda dentro las tarjetas que le tocan, en vez de mandar a otra parte.
 *
 * Se pueden tener **varios abiertos a la vez**, por eso el estado es un conjunto de ids y no un
 * único índice: cerrar una sección para poder abrir otra sería pelearse con la pantalla.
 */
import type { ReactNode } from "react";
import {
  Bell, BriefcaseBusiness, ChevronDown, ChevronRight, FileText, Menu, MoreHorizontal,
  Search, UserRound,
} from "lucide-react";
import { iniciales } from "../../utils/format";
import { HeroPerfilGS, type Fuente } from "./HeroPerfilGS";
import type { Colaborador, Puesto } from "../../types/domain";

/** Un acceso y lo que guarda dentro. */
export interface GrupoPerfil {
  id: string;
  label: string;
  icon: typeof UserRound;
  contenido: ReactNode;
}

/** Los iconos de los tres accesos, heredados del original. */
export const ICONOS_GRUPO = {
  personal: UserRound,
  profesional: FileText,
  empleo: BriefcaseBusiness,
} as const;

interface Props {
  yo: Colaborador;
  puesto?: Puesto;
  grupos: GrupoPerfil[];
  onMenu: () => void;
  onFuente: (f: Fuente) => void;
  cargandoFuente: Fuente | null;
  onManual: () => void;
  /** La barra de "perfil completo". Va ENTRE el hero y los accesos, que es donde se pidió. */
  barraCompletitud?: ReactNode;
  /** Ids de los grupos abiertos; lo gobierna la página para poder abrirlos desde fuera. */
  abiertos: Set<string>;
  onAlternar: (id: string) => void;
}

export function CabeceraGS({
  yo, puesto, grupos, onMenu, onFuente, cargandoFuente, onManual,
  barraCompletitud, abiertos, onAlternar,
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

      <HeroPerfilGS
        yo={yo}
        puesto={puesto}
        onFuente={onFuente}
        cargandoFuente={cargandoFuente}
        onManual={onManual}
      />

      {barraCompletitud}

      <section className="gs-lista">
        {grupos.map(({ id, label, icon: Icon, contenido }) => {
          const abierto = abiertos.has(id);
          return (
            <div key={id} className={"gs-grupo" + (abierto ? " abierto" : "")}>
              <button className="gs-lista-item" onClick={() => onAlternar(id)} aria-expanded={abierto}>
                <Icon size={17} strokeWidth={1.7} className="gs-lista-icono" />
                <span>{label}</span>
                {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {abierto && <div className="gs-grupo-cuerpo">{contenido}</div>}
            </div>
          );
        })}
      </section>
    </>
  );
}
