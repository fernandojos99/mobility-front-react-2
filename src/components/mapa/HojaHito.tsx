/**
 * La hoja inferior que se abre al pulsar un nodo.
 *
 * En el componente original el botón dice "Jugar". Aquí dice "Cómo lo consigo" y lista pasos
 * concretos. Y para un hito bloqueado no se dice "Bloqueado" a secas: se dice QUÉ lo desbloquea,
 * que es la diferencia entre un muro y una instrucción.
 *
 * Desde que la pantalla del mapa dejó de repetir el camino en texto, esta hoja es la ÚNICA forma de
 * leer el detalle de un hito, así que carga con todo lo que se sabe de él: en qué paso va, su
 * estado, la brecha de nivel sobre el termómetro, la prioridad y cómo cumplirlo.
 */
import { Lock, Star, Flag } from "lucide-react";
import type { Hito } from "../../types/domain";

interface Props {
  hito: Hito | null;
  hitos: Hito[];
  onCerrar: () => void;
}

const TITULO_CAMPO: Record<Hito["campo"], string> = {
  capacidades: "Capacidad del descriptivo",
  estudios: "Estudios",
  puestos: "Escalafón",
  historial: "Historial comprobable",
  desempeno: "Desempeño",
};

const PALABRA_ESTADO: Record<Hito["estado"], string> = {
  cumplido: "Cumplido",
  actual: "Tu siguiente paso",
  bloqueado: "Bloqueado",
};

/** El nivel sobre el termómetro rojo→verde, el mismo de `/yo/gap` y `/yo/aspiracion`. */
function Termometro({ valor }: { valor: number }) {
  const pct = (Math.min(5, Math.max(0, valor)) / 5) * 100;
  return (
    <div className="hoja-term">
      <span className="hoja-term-marca" style={{ left: `${pct}%` }} />
    </div>
  );
}

export function HojaHito({ hito, hitos, onCerrar }: Props) {
  const abierta = hito !== null;
  const previo = hito?.requiere.length
    ? hitos.find((h) => h.id === hito.requiere[0])
    : undefined;
  const paso = hito ? hitos.findIndex((h) => h.id === hito.id) + 1 : 0;

  return (
    <div className={"hoja" + (abierta ? " abierta" : "")} role="dialog" aria-labelledby="hoja-titulo" aria-hidden={!abierta}>
      {hito && (
        <>
          <div className="hoja-cabeza">
            <span className={"chip " + (hito.estado === "cumplido" ? "ok" : hito.estado === "actual" ? "gold" : "lock")}>
              {hito.estado === "cumplido" ? <Star size={12} /> : hito.estado === "actual" ? <Flag size={12} /> : <Lock size={12} />}
              {PALABRA_ESTADO[hito.estado]}
            </span>
            <span className="hoja-paso">Paso {paso} de {hitos.length}</span>
          </div>

          <h2 id="hoja-titulo">{hito.titulo}</h2>
          <p className="hoja-campo">
            {TITULO_CAMPO[hito.campo]}
            <span className={"hoja-prio " + hito.prioridad}>Prioridad {hito.prioridad}</span>
          </p>
          <p>{hito.descripcion}</p>

          {/* La brecha, con el mismo termómetro que usan las otras pantallas. */}
          <div className="hoja-niveles">
            <div>
              <span>Hoy <b>{hito.nivelActual}/5</b></span>
              <Termometro valor={hito.nivelActual} />
            </div>
            <div>
              <span>Meta <b>{hito.nivelMeta}/5</b></span>
              <Termometro valor={hito.nivelMeta} />
            </div>
          </div>

          {hito.estado === "bloqueado" && previo && (
            <p className="hoja-desbloqueo">
              <Lock size={13} /> Primero necesitas cumplir <b>{previo.titulo}</b>.
            </p>
          )}

          {hito.comoCumplirlo.length > 0 && (
            <>
              <h3>Cómo lo consigo</h3>
              <ul className="hoja-pasos">
                {hito.comoCumplirlo.map((paso) => <li key={paso}>{paso}</li>)}
              </ul>
            </>
          )}

          {hito.estado === "cumplido" && hito.comoCumplirlo.length === 0 && (
            <p className="hoja-desbloqueo">
              <Star size={13} /> Ya lo tienes cubierto. No hay nada pendiente en este paso.
            </p>
          )}

          <div className="hoja-acciones">
            <button className="btn ghost" onClick={onCerrar}>Cerrar</button>
          </div>
        </>
      )}
    </div>
  );
}
