/**
 * Pantalla `/yo/aspiracion` — Brújula de crecimiento.
 *
 * El diseño viene de `front/roadmap/career-progression-dashboard/`: avance hacia el puesto,
 * comparación de roles, brechas y ruta. Se copia la estructura; **su paleta no** —el original es
 * verde con acento amarillo— porque aquí manda la de `/yo`. Ver `components/roadmap/roadmap.css`.
 *
 * Del original se descartan su barra superior, su fila de bienvenida y su navegación inferior; en su
 * lugar va el hero de perfil de `/yo`, el mismo componente que usan las otras dos pantallas. Y donde
 * estaba su `<select>` de "Puesto deseado" va `SelectorDestino`, que es la tarjeta de "Cambiar de
 * destino" de siempre, ahora plegable.
 *
 * TODO lo que se lee aquí sale del mismo `Camino` que anima el mapa de `/yo/camino/:puestoId`.
 */
import { useCallback, useEffect, useState } from "react";
import { colaboradorService } from "../services/colaboradorService";
import { useData } from "../store/DataProvider";
import { useSesion } from "../contexts/SesionContext";
import { useYo } from "../hooks/useYo";
import { HeroPerfilGS } from "../components/perfil/HeroPerfilGS";
import { SelectorDestino } from "../components/roadmap/SelectorDestino";
import {
  ComparacionRoles, HeroBrujula, ListaBrechas, RutaPasos,
} from "../components/roadmap/SeccionesBrujula";
import "../components/perfil/gs.css";
import "../components/roadmap/roadmap.css";
import type { Camino, GapActual, PuestoCompatible } from "../types/domain";

/** "2 años" / "3 meses" a partir de la fecha de inicio en el puesto. */
function antiguedadDe(desde: string): string {
  const m = /(\d{1,2})\s+([a-záéíóúñ]{3,})\.?\s+(\d{4})/i.exec(desde);
  if (!m) return "antigüedad sin registrar";
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const mes = meses.indexOf(m[2].slice(0, 3).toLowerCase());
  if (mes < 0) return "antigüedad sin registrar";
  const inicio = new Date(Number(m[3]), mes, Number(m[1]));
  const hoy = new Date();
  let n = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth());
  if (hoy.getDate() < inicio.getDate()) n -= 1;
  n = Math.max(0, n);
  const anios = Math.floor(n / 12);
  if (anios >= 1) return `${anios} ${anios === 1 ? "año" : "años"}`;
  return `${n} ${n === 1 ? "mes" : "meses"}`;
}

export function AspiracionesPage() {
  const yo = useYo();
  const { actualizarColaborador, puestoDe } = useData();
  const { toast } = useSesion();
  const [puestos, setPuestos] = useState<PuestoCompatible[]>([]);
  const [camino, setCamino] = useState<Camino | null>(null);
  /* El cumplimiento del puesto ACTUAL vive en el gap, no en el camino: hay que pedirlo aparte. */
  const [gap, setGap] = useState<GapActual | null>(null);
  const [guardando, setGuardando] = useState("");

  useEffect(() => {
    if (!yo) return;
    void colaboradorService.puestos(yo.id).then(setPuestos);
    void colaboradorService.gap(yo.id).then(setGap).catch(() => setGap(null));
  }, [yo]);

  const objetivo = yo?.aspiracion?.puestoObjetivoId;

  useEffect(() => {
    if (!yo || !objetivo) { setCamino(null); return; }
    void colaboradorService.camino(yo.id, objetivo).then(setCamino);
  }, [yo, objetivo]);

  const elegir = useCallback(async (puestoId: string) => {
    if (!yo) return;
    setGuardando(puestoId);
    try {
      const actualizado = await colaboradorService.definirAspiracion(yo.id, puestoId);
      actualizarColaborador(actualizado);
      toast("Aspiración guardada");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando("");
    }
  }, [yo, actualizarColaborador, toast]);

  if (!yo) return null;

  const puestoActual = puestoDe(yo.puestoActualId);
  const selector = (
    <SelectorDestino
      puestos={puestos}
      objetivo={objetivo}
      objetivoTitulo={camino?.puestoObjetivoTitulo}
      guardando={guardando}
      onElegir={(id) => void elegir(id)}
      destacado={!camino}
    />
  );

  return (
    <div className="gs-fondo">
      <div className="gs">
        <HeroPerfilGS yo={yo} puesto={puestoActual} />

        <div className="rm">
          <div className="rm-wrap">
            {camino ? (
              <>
                <HeroBrujula camino={camino} />
                <ComparacionRoles
                  camino={camino}
                  puestoActual={puestoActual?.titulo ?? "Puesto sin asignar"}
                  areaActual={yo.area}
                  antiguedad={antiguedadDe(yo.antiguedadDesde)}
                  cumplimiento={gap?.cumplimiento ?? 0}
                  selector={selector}
                />
                <ListaBrechas hitos={camino.hitos} />
                <RutaPasos camino={camino} />

                {/* Segundo selector, ya desplegado: aquí no hay que descubrir nada, sólo cambiar. */}
                <section className="rm-sec">
                  <div className="rm-sec-cab">
                    <div>
                      <p className="rm-eyebrow">¿TE INTERESA OTRO PUESTO?</p>
                      <h2>Cambiar de destino</h2>
                    </div>
                  </div>
                  <SelectorDestino
                    puestos={puestos}
                    objetivo={objetivo}
                    objetivoTitulo={camino.puestoObjetivoTitulo}
                    guardando={guardando}
                    onElegir={(id) => void elegir(id)}
                    siempreAbierto
                    etiqueta="Elige otro puesto"
                  />
                </section>
              </>
            ) : (
              /* Sin aspiración no hay camino que pintar: sólo el selector, abierto. Es el caso de
                 Paulina (5) en el seed, que existe justamente para enseñar este estado. */
              <section className="rm-sec">
                <div className="rm-sec-cab">
                  <div>
                    <p className="rm-eyebrow">PRIMER PASO</p>
                    <h2>Elige a dónde quieres llegar</h2>
                  </div>
                </div>
                <p style={{
                  color: "var(--gs-muted-foreground)", fontSize: 13, lineHeight: 1.55,
                  maxWidth: 460, marginBottom: 18,
                }}>
                  Sin un puesto objetivo no hay camino que trazar. Elige uno y te enseñamos qué te
                  falta exactamente y en qué orden conseguirlo.
                </p>
                {selector}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
