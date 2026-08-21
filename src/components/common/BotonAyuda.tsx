/**
 * El "?" de las tarjetas, que hasta ahora no hacía nada.
 *
 * Venía del componente de referencia como adorno y se repitió en todas las tarjetas. Ahora abre un
 * modal con una explicación de la sección.
 *
 * Lo que escribe cada texto NO es repetir el título: es decir **de dónde sale el dato y qué se hace
 * con él**. Una ayuda que dice "aquí van tus certificaciones" sobre una tarjeta titulada
 * "Certificaciones" no ayuda a nadie.
 */
import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { Modal } from "./Modal";

interface Props {
  titulo: string;
  /** Uno o varios párrafos. */
  texto: string[];
}

export function BotonAyuda({ titulo, texto }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        className="gs-ayuda"
        onClick={() => setAbierto(true)}
        aria-label={`Qué es «${titulo}»`}
        title={`Qué es «${titulo}»`}
      >
        <CircleHelp size={15} strokeWidth={2} />
      </button>

      {abierto && (
        <Modal onClose={() => setAbierto(false)}>
          <div className="ayuda">
            <h3>{titulo}</h3>
            {texto.map((p) => <p key={p}>{p}</p>)}
            <button className="ayuda-ok" onClick={() => setAbierto(false)}>Entendido</button>
          </div>
        </Modal>
      )}
    </>
  );
}
