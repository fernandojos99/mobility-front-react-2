/**
 * Una tarjeta de sección del perfil. Es el `ExperienceCard` del componente de referencia —mismas
 * medidas, mismo estado vacío, misma ilustración— con lo que le faltaba para servir: la lista de
 * registros, el formulario en línea y el guardado.
 *
 * Es UNO solo para las seis secciones. Lo que cambia entre ellas es el DESCRIPTOR de campos, no el
 * comportamiento: seis tarjetas a medida serían seis sitios donde arreglar el mismo fallo.
 *
 * El guardado es por sección a propósito: `PUT /colaboradores/:id` hace merge parcial, así que
 * mandar `{ educacion: [...] }` no pisa nada más del colaborador.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, CircleHelp, Loader2, Plus, X } from "lucide-react";
import { esMxAIso, isoAEsMx } from "../../utils/format";

export type TipoCampo = "texto" | "textarea" | "select" | "fecha" | "lista";

export interface CampoDef {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  /** Sólo para `select`. Sale siempre de `catalogos`: el front no inventa listas de dominio. */
  opciones?: string[];
  /** El consejo bajo el campo. Obligatorio: un campo sin pista es un campo que se llena mal. */
  consejo: string;
  ancho?: boolean;
}

export interface FilaResumen {
  titulo: string;
  sub?: string;
  meta?: string;
  texto?: string;
}

/** Todos los campos del dominio que se editan aquí son texto o lista de texto. */
export type Registro = Record<string, string | string[] | undefined>;

interface Props {
  id?: string;
  titulo: string;
  campos: CampoDef[];
  registros: Registro[];
  fila: (r: Registro) => FilaResumen;
  /** Pregunta del estado vacío. En el original es "¿Desea agregar un registro ahora?". */
  vacio?: string;
  onGuardar: (registros: Registro[]) => Promise<void>;
}

/** Ilustración del estado vacío, la misma del componente de referencia. */
const IMG_VACIO =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qZhJ4xiN289ReGpMhdVFZpEEq8U6Gv.png";

/** Cuántos registros se ven antes de pulsar "Ver todo". */
const VISIBLES = 2;

const vacioDe = (campos: CampoDef[]): Registro =>
  Object.fromEntries(campos.map((c) => [c.clave, c.tipo === "lista" ? [] : ""]));

export function TarjetaPerfil({ id, titulo, campos, registros, fila, vacio, onGuardar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [borrador, setBorrador] = useState<Registro>(() => vacioDe(campos));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const sinRegistros = registros.length === 0;
  const mostrados = expandido ? registros : registros.slice(0, VISIBLES);
  const ocultos = registros.length - mostrados.length;

  const set = (clave: string, valor: string | string[]): void =>
    setBorrador((b) => ({ ...b, [clave]: valor }));

  const cerrar = (): void => {
    setAbierto(false);
    setBorrador(vacioDe(campos));
    setError("");
  };

  async function guardar(): Promise<void> {
    // El primer campo es el que identifica al registro: sin él la fila no se puede leer.
    const primero = borrador[campos[0].clave];
    if (!primero || (Array.isArray(primero) ? primero.length === 0 : !primero.trim())) {
      setError(`${campos[0].etiqueta} es obligatorio.`);
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar([...registros, borrador]);
      cerrar();
      setExpandido(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(indice: number): Promise<void> {
    setGuardando(true);
    setError("");
    try {
      await onGuardar(registros.filter((_, i) => i !== indice));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo borrar.");
    } finally {
      setGuardando(false);
    }
  }

  const tituloId = `sec-${id ?? titulo}`;

  return (
    <section className="gs-card" id={id} aria-labelledby={tituloId}>
      <div className="gs-card-cab">
        <h3 id={tituloId}>{titulo}</h3>
        <button className="gs-ayuda" aria-label={`Ayuda sobre ${titulo.toLowerCase()}`}>
          <CircleHelp size={15} strokeWidth={2} />
        </button>
      </div>

      {sinRegistros && !abierto && (
        <div className="gs-vacio">
          <img src={IMG_VACIO} alt="Ilustración de una caja vacía" />
          <h4>Aún no hay datos</h4>
          <p>{vacio ?? "¿Desea agregar un registro ahora?"}</p>
          <button type="button" className="gs-btn-sec" onClick={() => setAbierto(true)}>
            Agregar
          </button>
        </div>
      )}

      {mostrados.map((r, i) => {
        const f = fila(r);
        return (
          <div className="gs-registro" key={i}>
            <div className="gs-registro-fila">
              <div className="gs-registro-cuerpo">
                <div className="gs-registro-tit">{f.titulo}</div>
                {f.sub && <div className="gs-registro-sub">{f.sub}</div>}
                {f.meta && <div className="gs-registro-meta">{f.meta}</div>}
                {f.texto && <div className="gs-registro-txt">{f.texto}</div>}
              </div>
              <button
                className="gs-quitar"
                onClick={() => void borrar(i)}
                disabled={guardando}
                aria-label={`Eliminar ${f.titulo}`}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        );
      })}

      {abierto && (
        <div className="gs-form">
          <div className="gs-campos">
            {campos.map((c) => (
              <Campo key={c.clave} def={c} valor={borrador[c.clave]} onCambio={(v) => set(c.clave, v)} />
            ))}
          </div>
          {error && <p className="gs-error">{error}</p>}
          <div className="gs-pie">
            <button className="gs-btn-pri" onClick={() => void guardar()} disabled={guardando}>
              {guardando ? <><Loader2 size={13} className="girando" /> Guardando…</> : "Guardar"}
            </button>
            <button className="gs-btn-sec" onClick={cerrar} disabled={guardando}>Cancelar</button>
          </div>
        </div>
      )}

      {!abierto && !sinRegistros && (
        <div className="gs-pie">
          <button className="gs-btn-sec" onClick={() => setAbierto(true)} disabled={guardando}>
            Agregar
          </button>
          {(ocultos > 0 || expandido) && (
            <button className="gs-btn-sec" onClick={() => setExpandido((v) => !v)}>
              {expandido
                ? <>Ver menos <ChevronUp size={12} style={{ verticalAlign: "-2px" }} /></>
                : <>Ver todo ({registros.length}) <ChevronDown size={12} style={{ verticalAlign: "-2px" }} /></>}
            </button>
          )}
        </div>
      )}

      {error && !abierto && <p className="gs-error">{error}</p>}

    </section>
  );
}

/** Un campo del formulario. El `consejo` se pinta siempre: es la pista pedida en cada input. */
function Campo({ def, valor, onCambio }: {
  def: CampoDef;
  valor: string | string[] | undefined;
  onCambio: (v: string | string[]) => void;
}) {
  const id = `campo-${def.clave}`;
  const texto = typeof valor === "string" ? valor : "";
  const ancho = def.ancho || def.tipo === "lista" || def.tipo === "textarea";

  return (
    <div className={"gs-campo" + (ancho ? " ancho" : "")}>
      <label htmlFor={id}>{def.etiqueta}</label>

      {def.tipo === "select" && (
        <select id={id} value={texto} onChange={(e) => onCambio(e.target.value)}>
          {/* El valor por defecto se lee "No seleccionado", no una opción en blanco. */}
          <option value="">No seleccionado</option>
          {(def.opciones ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {def.tipo === "textarea" && (
        <textarea id={id} value={texto} placeholder={def.consejo} onChange={(e) => onCambio(e.target.value)} />
      )}

      {/* Input nativo: en móvil abre el calendario del sistema, que es el que la gente ya sabe usar. */}
      {def.tipo === "fecha" && (
        <input id={id} type="date" value={esMxAIso(texto)} onChange={(e) => onCambio(isoAEsMx(e.target.value))} />
      )}

      {def.tipo === "texto" && (
        <input id={id} type="text" value={texto} placeholder={def.consejo} onChange={(e) => onCambio(e.target.value)} />
      )}

      {def.tipo === "lista" && (
        <CampoLista valor={Array.isArray(valor) ? valor : []} consejo={def.consejo} onCambio={onCambio} />
      )}

      <p className="gs-consejo">{def.consejo}</p>
    </div>
  );
}

/** Lista de textos repetible (responsabilidades, áreas). Una fila por elemento. */
function CampoLista({ valor, consejo, onCambio }: {
  valor: string[];
  consejo: string;
  onCambio: (v: string[]) => void;
}) {
  return (
    <>
      <div className="gs-lista-campo">
        {valor.map((v, i) => (
          <div className="gs-lista-campo-fila" key={i}>
            <input
              type="text"
              value={v}
              placeholder={consejo}
              onChange={(e) => onCambio(valor.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <button
              className="gs-quitar"
              onClick={() => onCambio(valor.filter((_, j) => j !== i))}
              aria-label="Quitar elemento"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <button className="gs-btn-sec" onClick={() => onCambio([...valor, ""])}>
        <Plus size={12} style={{ verticalAlign: "-2px" }} /> Añadir
      </button>
    </>
  );
}
