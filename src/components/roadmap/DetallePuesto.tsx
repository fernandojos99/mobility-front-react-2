/**
 * Qué pide un puesto y qué le falta a esta persona, sin salir de la lista.
 *
 * Cruza dos cosas que ya existen: el `descriptivo` del puesto (que trae el `DataProvider`) y el
 * camino hacia él (`colaboradorService.camino`), que es quien sabe lo que falta.
 *
 * El camino se pide **al abrir**, no al pintar la lista: son dieciséis puestos y traer los dieciséis
 * caminos para que se miren uno o dos sería tirar el trabajo del servidor a la basura.
 */
import { useEffect, useState } from "react";
import { Check, Loader2, MapPin, X } from "lucide-react";
import { colaboradorService } from "../../services/colaboradorService";
import { Modal } from "../common/Modal";
import { money } from "../../utils/format";
import type { Camino, Colaborador, Puesto } from "../../types/domain";

interface Props {
  yo: Colaborador;
  puesto: Puesto;
  compatibilidad: number;
  onCerrar: () => void;
}

/** Una lista de requisitos marcando cuáles ya cumple. */
function Requisitos({ titulo, pedidos, tiene }: {
  titulo: string;
  pedidos: string[];
  tiene: string[];
}) {
  if (pedidos.length === 0) return null;
  return (
    <div className="dp-bloque">
      <h4>{titulo}</h4>
      <div className="dp-reqs">
        {pedidos.map((r) => {
          const ok = tiene.includes(r);
          return (
            <span className={"dp-req" + (ok ? " ok" : "")} key={r}>
              {ok ? <Check size={12} /> : <X size={12} />} {r}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function DetallePuesto({ yo, puesto, compatibilidad, onCerrar }: Props) {
  const [camino, setCamino] = useState<Camino | null>(null);
  const [error, setError] = useState("");
  const req = puesto.descriptivo;

  useEffect(() => {
    let vivo = true;
    colaboradorService.camino(yo.id, puesto.id)
      .then((c) => { if (vivo) setCamino(c); })
      .catch((e) => { if (vivo) setError(e instanceof Error ? e.message : "No se pudo calcular"); });
    return () => { vivo = false; };
  }, [yo.id, puesto.id]);

  const pendientes = camino?.hitos.filter((h) => h.estado !== "cumplido") ?? [];

  return (
    <Modal onClose={onCerrar} wide>
      <div className="dp">
        <p className="dp-kicker">Puesto del catálogo</p>
        <h3>{puesto.titulo}</h3>
        <p className="dp-sub">{puesto.area} · {puesto.nivel} · Compatibilidad de hoy: {compatibilidad} %</p>

        <p className="dp-desc">{req.descripcion}</p>

        <div className="dp-datos">
          <div><span>Experiencia</span><b>{req.anosExp} {req.anosExp === 1 ? "año" : "años"}</b></div>
          <div><span>Estudios</span><b>{req.educacion}</b></div>
          <div><span>Ubicación</span><b><MapPin size={11} /> {req.ubicacionTrabajo}</b></div>
          <div><span>Modalidad</span><b>{req.modalidad}</b></div>
          {!req.sueldoOculto && (
            <div><span>Sueldo</span><b>{money(req.salarioMin)} – {money(req.salarioMax)}</b></div>
          )}
        </div>

        <Requisitos titulo="Capacidades que pide" pedidos={req.espRequeridas} tiene={yo.esp} />
        <Requisitos titulo="Habilidades técnicas" pedidos={req.hardSkills} tiene={yo.hard} />
        <Requisitos titulo="Habilidades blandas" pedidos={req.softSkills} tiene={yo.soft} />

        <div className="dp-bloque">
          <h4>Lo que te falta para llegar</h4>
          {error && <p className="dp-vacio">{error}</p>}
          {!camino && !error && (
            <p className="dp-vacio"><Loader2 size={13} className="girando" /> Calculando tu camino…</p>
          )}
          {camino && pendientes.length === 0 && (
            <p className="dp-vacio">Nada: ya cubres todo lo que pide este puesto.</p>
          )}
          {pendientes.length > 0 && (
            <ol className="dp-pasos">
              {pendientes.map((h) => (
                <li key={h.id}>
                  <b>{h.titulo}</b>
                  <span>{h.descripcion}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Modal>
  );
}
