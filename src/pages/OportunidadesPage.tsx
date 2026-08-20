/**
 * Pantalla 4 — Oportunidades. Dos pestañas: vacantes y proyectos.
 *
 * Vacantes: espejo hardcodeado de Radar. Solo se muestran; el clic lleva a Radar, salvo que estén
 * bloqueadas, en cuyo caso lleva al camino.
 * Proyectos: no son un cambio de puesto, y por eso la antigüedad no se aplica aquí.
 *
 * La piel es la misma que la de `/yo`, `/yo/gap` y `/yo/aspiracion`: la hoja blanca sobre fondo
 * gris, los tokens `--gs-*`/`--rm-*` y su pila tipográfica. Por eso todo va dentro de `.gs .rm`.
 * Lleva también el hero de perfil, para que la navegación en iconos esté en las cuatro pantallas.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Boxes, ArrowUpDown, ChevronDown } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { proyectoService } from "../services/proyectoService";
import { useData } from "../store/DataProvider";
import { useSesion } from "../contexts/SesionContext";
import { useYo } from "../hooks/useYo";
import { HeroPerfilGS } from "../components/perfil/HeroPerfilGS";
import { VacanteCard, resumenBloqueos } from "../components/oportunidades/VacanteCard";
import { ProyectoCard } from "../components/oportunidades/ProyectoCard";
import "../components/perfil/gs.css";
import "../components/roadmap/roadmap.css";
import "../components/oportunidades/oportunidades.css";
import type { ProyectoOportunidad, VacanteOportunidad } from "../types/domain";

type Orden = "compatibilidad" | "fecha" | "titulo" | "sueldo";

const ORDENES: { valor: Orden; texto: string }[] = [
  { valor: "compatibilidad", texto: "Compatibilidad" },
  { valor: "fecha", texto: "Fecha de publicación" },
  { valor: "titulo", texto: "Título" },
  { valor: "sueldo", texto: "Sueldo" },
];

export function OportunidadesPage() {
  const yo = useYo();
  const { catalogos, puestoDe } = useData();
  const { toast } = useSesion();
  const [pestana, setPestana] = useState<"vacantes" | "proyectos">("vacantes");
  const [vacantes, setVacantes] = useState<VacanteOportunidad[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoOportunidad[]>([]);
  const [postulando, setPostulando] = useState("");

  // Filtros, copiados de los de Radar: ubicación, área, orden y dirección.
  const [ciudad, setCiudad] = useState("");
  const [area, setArea] = useState("");
  const [orden, setOrden] = useState<Orden>("compatibilidad");
  const [desc, setDesc] = useState(true);
  const [soloTipo, setSoloTipo] = useState("");

  const cargar = useCallback(async (id: number) => {
    const [v, p] = await Promise.all([colaboradorService.vacantes(id), colaboradorService.proyectos(id)]);
    setVacantes(v);
    setProyectos(p);
  }, []);

  useEffect(() => { if (yo) void cargar(yo.id); }, [yo, cargar]);

  const postular = useCallback(async (proyectoId: string) => {
    if (!yo) return;
    setPostulando(proyectoId);
    try {
      await proyectoService.postular(proyectoId, yo.id);
      await cargar(yo.id);
      toast("Postulación enviada al dueño del proyecto");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo postular");
    } finally {
      setPostulando("");
    }
  }, [yo, cargar, toast]);

  const vacantesVisibles = useMemo(() => {
    const filtradas = vacantes.filter(
      (v) => (!ciudad || v.vacante.req.ubicacionTrabajo === ciudad) && (!area || v.vacante.req.area === area),
    );
    const signo = desc ? -1 : 1;
    return [...filtradas].sort((a, b) => {
      if (orden === "compatibilidad") return signo * (a.compatibilidad - b.compatibilidad);
      if (orden === "sueldo") return signo * ((a.vacante.req.sueldo ?? 0) - (b.vacante.req.sueldo ?? 0));
      if (orden === "titulo") return -signo * a.vacante.req.titulo.localeCompare(b.vacante.req.titulo);
      return signo * (a.vacante.creada.localeCompare(b.vacante.creada));
    });
  }, [vacantes, ciudad, area, orden, desc]);

  const proyectosVisibles = useMemo(
    () => proyectos.filter((p) => !soloTipo || p.proyecto.tipo === soloTipo),
    [proyectos, soloTipo],
  );

  if (!yo) return null;

  const bloqueadas = vacantes.filter((v) => v.bloqueo.bloqueado).length;
  const califica = proyectos.filter((p) => p.califica && !p.participa).length;

  return (
    <div className="gs-fondo">
      <div className="gs">
        <HeroPerfilGS yo={yo} puesto={puestoDe(yo.puestoActualId)} />

        <div className="rm">
          <div className="op-wrap">
            <div className="op-tabs" role="group" aria-label="Tipo de oportunidad">
              <button
                className={"op-tab" + (pestana === "vacantes" ? " on" : "")}
                onClick={() => setPestana("vacantes")}
              >
                <Briefcase size={14} /> Vacantes ({vacantes.length})
              </button>
              <button
                className={"op-tab" + (pestana === "proyectos" ? " on" : "")}
                onClick={() => setPestana("proyectos")}
              >
                <Boxes size={14} /> Proyectos ({proyectos.length})
              </button>
            </div>

            {pestana === "vacantes" ? (
              <>
                <div className="op-cab">
                  <p className="rm-eyebrow">VACANTES AFINES</p>
                  <h2>Puestos que encajan con tu perfil</h2>
                  <p>
                    {resumenBloqueos(bloqueadas, vacantes.length)} La postulación real ocurre en
                    Radar de Candidatos: aquí solo se muestran.
                  </p>
                </div>

                <div className="op-filtros">
                  <div className="op-campo">
                    <label htmlFor="f-ciudad">Ubicación</label>
                    <div className="op-campo-fila">
                      <div className="op-campo-sel">
                        <select id="f-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                          <option value="">Todas</option>
                          {(catalogos?.ciudades ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="op-campo">
                    <label htmlFor="f-area">Área</label>
                    <div className="op-campo-fila">
                      <div className="op-campo-sel">
                        <select id="f-area" value={area} onChange={(e) => setArea(e.target.value)}>
                          <option value="">Todas</option>
                          {(catalogos?.areas ?? []).map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="op-campo">
                    <label htmlFor="f-orden">Ordenar por</label>
                    <div className="op-campo-fila">
                      <div className="op-campo-sel">
                        <select id="f-orden" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
                          {ORDENES.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                        </select>
                        <ChevronDown size={16} />
                      </div>
                      <button
                        className="op-invertir"
                        onClick={() => setDesc((d) => !d)}
                        title={desc ? "De mayor a menor" : "De menor a mayor"}
                        aria-label="Invertir el orden"
                      >
                        <ArrowUpDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="op-grid">
                  {vacantesVisibles.map((v) => <VacanteCard key={v.vacante.id} {...v} />)}
                </div>
                {!vacantesVisibles.length && (
                  <div className="op-card">
                    <div className="op-vacio">
                      <h3>Ninguna vacante coincide con el filtro</h3>
                      <p>Prueba a quitar la ubicación o el área.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="op-cab">
                  <p className="rm-eyebrow">PROYECTOS LATERALES</p>
                  <h2>Trabajo con el que ganar evidencia</h2>
                  <p>
                    Los proyectos no son un cambio de puesto: son trabajo en otra unidad de negocio
                    que te deja aprender de ella. <b>Aquí la antigüedad no cuenta</b> — puedes entrar
                    desde tu primer día. Cumples los requisitos de {califica} de {proyectos.length}.
                  </p>
                </div>

                <div className="op-tabs">
                  <button className={"op-tab" + (soloTipo === "" ? " on" : "")} onClick={() => setSoloTipo("")}>
                    Todos
                  </button>
                  {(catalogos?.tiposProyecto ?? []).map((t) => (
                    <button
                      key={t}
                      className={"op-tab" + (soloTipo === t ? " on" : "")}
                      onClick={() => setSoloTipo(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="op-grid">
                  {proyectosVisibles.map((p) => (
                    <ProyectoCard key={p.proyecto.id} {...p}
                      postulando={postulando === p.proyecto.id}
                      onPostular={(id) => void postular(id)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
