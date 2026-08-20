/**
 * El hero del perfil: banner, avatar superpuesto, nombre y cargo. Es la parte central del
 * componente `perfil-de-personas`, extraída para poder repetirla en `/yo/gap` sin arrastrar la
 * barra superior de Grupo Salinas ni la lista de accesos.
 *
 * `accion` es opcional: en `/yo` lleva el botón "Todas las acciones" del original; en `/yo/gap` no
 * lleva nada, porque ahí la pantalla no ofrece acciones sobre el perfil.
 */
import type { ReactNode } from "react";
import { iniciales } from "../../utils/format";
import type { Colaborador, Puesto } from "../../types/domain";

/** URL del original, tal cual. */
const BANNER =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85";

interface Props {
  yo: Colaborador;
  puesto?: Puesto;
  accion?: ReactNode;
}

export function HeroPerfilGS({ yo, puesto, accion }: Props) {
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
          {accion}
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
      </div>
    </section>
  );
}
