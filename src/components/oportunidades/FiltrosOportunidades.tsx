/**
 * La fila de filtros de Oportunidades, compartida por las dos pestañas.
 *
 * Vacantes y proyectos filtran por lo mismo —ubicación, área, orden y favoritos—, así que mantener
 * dos filas gemelas sería garantizar que un día dejen de parecerse. Lo único que cambia entre ellas
 * son los criterios de ordenación, que llegan por prop.
 */
import { ArrowUpDown, ChevronDown, Heart } from "lucide-react";

export interface OpcionOrden {
  valor: string;
  texto: string;
}

interface Props {
  ciudades: string[];
  areas: string[];
  ordenes: OpcionOrden[];
  ciudad: string;
  area: string;
  orden: string;
  desc: boolean;
  soloFavoritos: boolean;
  /** Cuántos favoritos hay EN ESTA pestaña. */
  nFavoritos: number;
  onCiudad: (v: string) => void;
  onArea: (v: string) => void;
  onOrden: (v: string) => void;
  onDesc: () => void;
  onFavoritos: () => void;
  /** Para no repetir ids de `label` cuando las dos pestañas existen a la vez. */
  prefijo: string;
}

export function FiltrosOportunidades({
  ciudades, areas, ordenes, ciudad, area, orden, desc, soloFavoritos, nFavoritos,
  onCiudad, onArea, onOrden, onDesc, onFavoritos, prefijo,
}: Props) {
  return (
    <div className="op-filtros">
      <div className="op-campo">
        <label htmlFor={`${prefijo}-ciudad`}>Ubicación</label>
        <div className="op-campo-fila">
          <div className="op-campo-sel">
            <select id={`${prefijo}-ciudad`} value={ciudad} onChange={(e) => onCiudad(e.target.value)}>
              <option value="">Todas</option>
              {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="op-campo">
        <label htmlFor={`${prefijo}-area`}>Área</label>
        <div className="op-campo-fila">
          <div className="op-campo-sel">
            <select id={`${prefijo}-area`} value={area} onChange={(e) => onArea(e.target.value)}>
              <option value="">Todas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="op-campo">
        <label htmlFor={`${prefijo}-orden`}>Ordenar por</label>
        <div className="op-campo-fila">
          <div className="op-campo-sel">
            <select id={`${prefijo}-orden`} value={orden} onChange={(e) => onOrden(e.target.value)}>
              {ordenes.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
          <button
            className="op-invertir"
            onClick={onDesc}
            title={desc ? "De mayor a menor" : "De menor a mayor"}
            aria-label="Invertir el orden"
          >
            <ArrowUpDown size={16} />
          </button>
        </div>
      </div>

      <div className="op-campo op-campo-fav">
        <label>Guardadas</label>
        {/* Se desactiva cuando no hay ninguno: un filtro que sólo sabe vaciar la pantalla
            es una trampa. */}
        <button
          className={"op-fav-btn" + (soloFavoritos ? " on" : "")}
          onClick={onFavoritos}
          disabled={nFavoritos === 0 && !soloFavoritos}
          aria-pressed={soloFavoritos}
        >
          <Heart size={13} fill={soloFavoritos ? "currentColor" : "none"} />
          Sólo favoritos ({nFavoritos})
        </button>
      </div>
    </div>
  );
}
