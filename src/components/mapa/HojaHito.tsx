/**
 * La hoja inferior que se abre al pulsar un nodo.
 *
 * En el componente original el botón dice "Jugar". Aquí dice "Cómo lo consigo" y lista pasos
 * concretos. Y para un hito bloqueado no se dice "Bloqueado" a secas: se dice QUÉ lo desbloquea,
 * que es la diferencia entre un muro y una instrucción.
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

export function HojaHito({ hito, hitos, onCerrar }: Props) {
  const abierta = hito !== null;
  const previo = hito?.requiere.length
    ? hitos.find((h) => h.id === hito.requiere[0])
    : undefined;

  return (
    <div className={"hoja" + (abierta ? " abierta" : "")} role="dialog" aria-labelledby="hoja-titulo" aria-hidden={!abierta}>
      {hito && (
        <>
          <div className="hoja-cabeza">
            <span className={"chip " + (hito.estado === "cumplido" ? "ok" : hito.estado === "actual" ? "gold" : "lock")}>
              {hito.estado === "cumplido" ? <Star size={12} /> : hito.estado === "actual" ? <Flag size={12} /> : <Lock size={12} />}
              {TITULO_CAMPO[hito.campo]}
            </span>
          </div>
          <h2 id="hoja-titulo">{hito.titulo}</h2>
          <p>{hito.descripcion}</p>

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

          <div className="hoja-acciones">
            <button className="btn ghost" onClick={onCerrar}>Cerrar</button>
          </div>
        </>
      )}
    </div>
  );
}
