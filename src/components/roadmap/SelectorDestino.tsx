/**
 * "Cambiar de destino": elegir el puesto al que se aspira.
 *
 * Es la tarjeta que ya existía en `AspiracionesPage`, movida al hueco que ocupaba el `role-picker`
 * ("Puesto deseado") del dashboard de referencia y con su misma forma: cerrado es una fila con el
 * destino actual y un chevron.
 *
 * Va PLEGADO por defecto, que es lo que se pidió — abierto se come media pantalla en móvil y
 * empuja el mapa de brechas fuera de vista. Si todavía no hay aspiración se abre solo: ahí sí es
 * lo único que hay que hacer.
 */
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { AnilloAvance } from "../common/AnilloAvance";
import { useData } from "../../store/DataProvider";
import { useYo } from "../../hooks/useYo";
import { DetallePuesto } from "./DetallePuesto";
import type { PuestoCompatible } from "../../types/domain";

interface Props {
  puestos: PuestoCompatible[];
  /** Id del puesto al que ya aspira, si hay. */
  objetivo?: string;
  objetivoTitulo?: string;
  guardando: string;
  onElegir: (puestoId: string) => void;
  /** No se puede plegar. Lo usa la instancia del final, después de "Ver mi camino". */
  siempreAbierto?: boolean;
  /** Destaca el control: es el primer y único paso cuando todavía no hay destino. */
  destacado?: boolean;
  etiqueta?: string;
}

export function SelectorDestino({
  puestos, objetivo, objetivoTitulo, guardando, onElegir,
  siempreAbierto = false, destacado = false, etiqueta = "Puesto deseado",
}: Props) {
  const [plegable, setPlegable] = useState(!objetivo);
  /** Qué puesto se está mirando en detalle. */
  const [detalle, setDetalle] = useState<PuestoCompatible | null>(null);
  const { puestoDe } = useData();
  const yo = useYo();
  const abierto = siempreAbierto || plegable;
  const setAbierto = setPlegable;
  const [busqueda, setBusqueda] = useState("");

  // Si aparece una aspiración (recién elegida), el panel se cierra solo: ya cumplió su función.
  useEffect(() => { if (objetivo) setPlegable(false); }, [objetivo]);

  const filtrados = puestos.filter(
    (p) => !busqueda ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.area.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className={"rm-destino" + (destacado ? " primero" : "")}>
      <span className="rm-destino-label">{etiqueta}</span>

      {!siempreAbierto && (
        <button className="rm-destino-btn" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
          <span>
            {objetivoTitulo ?? "Elige tu puesto objetivo"}
            {!objetivoTitulo && <small> · todavía no has elegido</small>}
          </span>
          {abierto ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
      )}

      {abierto && (
        <div className="rm-destino-panel">
          <div className="rm-buscador">
            <Search size={15} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca por puesto o área"
              aria-label="Buscar puesto"
            />
          </div>
          <p className="rm-detalle p" style={{ fontSize: 11, color: "var(--gs-muted-foreground)", lineHeight: 1.45, marginBottom: 4 }}>
            El porcentaje es tu compatibilidad de hoy con el descriptivo de cada puesto. Nadie llega
            al 100 %: por encima de 70 % ya estás cerca.
          </p>

          {filtrados.map((p) => (
            <div key={p.puestoId} className="rm-opcion">
              <AnilloAvance v={p.compatibilidad} size={40} />
              <div className="rm-opcion-main">
                <b>{p.titulo}</b>
                <span>{p.area} · {p.nivel}</span>
              </div>
              <div className="rm-opcion-acciones">
                <button className="rm-opcion-btn ver" onClick={() => setDetalle(p)}>
                  Ver detalle
                </button>
                {objetivo === p.puestoId ? (
                  <span className="rm-opcion-actual">Tu aspiración</span>
                ) : (
                  <button
                    className="rm-opcion-btn"
                    disabled={guardando !== ""}
                    onClick={() => onElegir(p.puestoId)}
                  >
                    {guardando === p.puestoId ? "Guardando…" : "Aspirar a este"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {!filtrados.length && (
            <p style={{ fontSize: 11, color: "var(--gs-muted-foreground)", paddingTop: 8 }}>
              No hay puestos que coincidan con «{busqueda}».
            </p>
          )}
        </div>
      )}

      {detalle && yo && puestoDe(detalle.puestoId) && (
        <DetallePuesto
          yo={yo}
          puesto={puestoDe(detalle.puestoId)!}
          compatibilidad={detalle.compatibilidad}
          onCerrar={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
