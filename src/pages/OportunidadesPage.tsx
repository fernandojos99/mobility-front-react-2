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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Boxes } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { proyectoService } from "../services/proyectoService";
import { useData } from "../store/DataProvider";
import { useSesion } from "../contexts/SesionContext";
import { useYo } from "../hooks/useYo";
import { HeroPerfilGS } from "../components/perfil/HeroPerfilGS";
import { VacanteCard, resumenBloqueos } from "../components/oportunidades/VacanteCard";
import { ProyectoCard } from "../components/oportunidades/ProyectoCard";
import { FiltrosOportunidades } from "../components/oportunidades/FiltrosOportunidades";
import "../components/perfil/gs.css";
import "../components/roadmap/roadmap.css";
import "../components/oportunidades/oportunidades.css";
import type { ProyectoOportunidad, VacanteOportunidad } from "../types/domain";

type Orden = "compatibilidad" | "fecha" | "titulo" | "sueldo";
/** Los proyectos no tienen compatibilidad ni sueldo, así que ordenan por lo suyo. */
type OrdenProy = "califica" | "nombre" | "duracion" | "cupo";

const ORDENES = [
  { valor: "compatibilidad", texto: "Compatibilidad" },
  { valor: "fecha", texto: "Fecha de publicación" },
  { valor: "titulo", texto: "Título" },
  { valor: "sueldo", texto: "Sueldo" },
];

const ORDENES_PROY = [
  { valor: "califica", texto: "Los que ya calificas" },
  { valor: "nombre", texto: "Nombre" },
  { valor: "duracion", texto: "Duración" },
  { valor: "cupo", texto: "Lugares" },
];

export function OportunidadesPage() {
  const yo = useYo();
  const { catalogos, puestoDe, actualizarColaborador } = useData();
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
  const [ciudadP, setCiudadP] = useState("");
  const [areaP, setAreaP] = useState("");
  const [ordenP, setOrdenP] = useState<OrdenProy>("califica");
  const [descP, setDescP] = useState(true);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

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

  /*
   * La lista de favoritos EN CURSO, aparte del colaborador.
   *
   * Sin esto, marcar dos corazones seguidos pierde uno: los dos clics ocurren antes de que llegue
   * la respuesta del primero, así que ambos leen la misma lista vieja y el segundo `PUT` la manda
   * sin el primero. Aquí se apunta el cambio en el acto y el siguiente clic ya parte de él.
   */
  const favRef = useRef({ vacantesFavoritas: [] as string[], proyectosFavoritos: [] as string[] });
  useEffect(() => {
    if (yo) {
      favRef.current = {
        vacantesFavoritas: yo.vacantesFavoritas ?? [],
        proyectosFavoritos: yo.proyectosFavoritos ?? [],
      };
    }
  }, [yo]);

  /**
   * Marca o desmarca un favorito y lo guarda.
   *
   * `PUT /colaboradores/:id` hace merge parcial, así que basta con mandar el arreglo que cambió.
   * Se manda entero y no un "añade este": la lista es el dato, y calcularla aquí evita que el
   * backend tenga que saber de alternar nada.
   */
  const alternarFavorito = useCallback(
    async (campo: "vacantesFavoritas" | "proyectosFavoritos", id: string) => {
      if (!yo) return;
      const actuales = favRef.current[campo];
      const nuevos = actuales.includes(id)
        ? actuales.filter((x) => x !== id)
        : [...actuales, id];
      favRef.current = { ...favRef.current, [campo]: nuevos };
      try {
        actualizarColaborador(await colaboradorService.actualizar(yo.id, { [campo]: nuevos }));
      } catch (e) {
        favRef.current = { ...favRef.current, [campo]: actuales }; // se deshace lo apuntado
        toast(e instanceof Error ? e.message : "No se pudo guardar el favorito");
      }
    },
    [yo, actualizarColaborador, toast],
  );

  const vacantesVisibles = useMemo(() => {
    const favs = yo?.vacantesFavoritas ?? [];
    const filtradas = vacantes.filter(
      (v) => (!ciudad || v.vacante.req.ubicacionTrabajo === ciudad)
        && (!area || v.vacante.req.area === area)
        && (!soloFavoritos || favs.includes(v.vacante.id)),
    );
    const signo = desc ? -1 : 1;
    return [...filtradas].sort((a, b) => {
      if (orden === "compatibilidad") return signo * (a.compatibilidad - b.compatibilidad);
      if (orden === "sueldo") return signo * ((a.vacante.req.sueldo ?? 0) - (b.vacante.req.sueldo ?? 0));
      if (orden === "titulo") return -signo * a.vacante.req.titulo.localeCompare(b.vacante.req.titulo);
      return signo * (a.vacante.creada.localeCompare(b.vacante.creada));
    });
  }, [vacantes, ciudad, area, orden, desc, soloFavoritos, yo]);

  const proyectosVisibles = useMemo(() => {
    const favs = yo?.proyectosFavoritos ?? [];
    const filtrados = proyectos.filter(
      (p) => (!soloTipo || p.proyecto.tipo === soloTipo)
        && (!ciudadP || p.proyecto.ubicacion === ciudadP)
        && (!areaP || p.proyecto.area === areaP)
        && (!soloFavoritos || favs.includes(p.proyecto.id)),
    );
    const signo = descP ? -1 : 1;
    return [...filtrados].sort((a, b) => {
      if (ordenP === "califica") return signo * (Number(a.califica) - Number(b.califica));
      if (ordenP === "duracion") return signo * (a.proyecto.duracionMeses - b.proyecto.duracionMeses);
      if (ordenP === "cupo") return signo * (a.proyecto.cupo - b.proyecto.cupo);
      return -signo * a.proyecto.nombre.localeCompare(b.proyecto.nombre);
    });
  }, [proyectos, soloTipo, ciudadP, areaP, ordenP, descP, soloFavoritos, yo]);

  if (!yo) return null;

  const favVacantes = yo.vacantesFavoritas ?? [];
  const favProyectos = yo.proyectosFavoritos ?? [];
  /* La cuenta es de lo que hay EN ESTA pestaña: un filtro que dice 3 y enseña 0 no ayuda. */
  const nFav = pestana === "vacantes"
    ? vacantes.filter((v) => favVacantes.includes(v.vacante.id)).length
    : proyectos.filter((p) => favProyectos.includes(p.proyecto.id)).length;

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

                <FiltrosOportunidades
                  prefijo="vac"
                  ciudades={catalogos?.ciudades ?? []}
                  areas={catalogos?.areas ?? []}
                  ordenes={ORDENES}
                  ciudad={ciudad} area={area} orden={orden} desc={desc}
                  soloFavoritos={soloFavoritos} nFavoritos={nFav}
                  onCiudad={setCiudad}
                  onArea={setArea}
                  onOrden={(v) => setOrden(v as Orden)}
                  onDesc={() => setDesc((d) => !d)}
                  onFavoritos={() => setSoloFavoritos((v) => !v)}
                />

                <div className="op-grid">
                  {vacantesVisibles.map((v) => (
                    <VacanteCard
                      key={v.vacante.id}
                      {...v}
                      favorita={favVacantes.includes(v.vacante.id)}
                      onFavorita={(id) => void alternarFavorito("vacantesFavoritas", id)}
                    />
                  ))}
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

                <FiltrosOportunidades
                  prefijo="pro"
                  ciudades={catalogos?.ciudades ?? []}
                  areas={catalogos?.areas ?? []}
                  ordenes={ORDENES_PROY}
                  ciudad={ciudadP} area={areaP} orden={ordenP} desc={descP}
                  soloFavoritos={soloFavoritos} nFavoritos={nFav}
                  onCiudad={setCiudadP}
                  onArea={setAreaP}
                  onOrden={(v) => setOrdenP(v as OrdenProy)}
                  onDesc={() => setDescP((d) => !d)}
                  onFavoritos={() => setSoloFavoritos((v) => !v)}
                />

                {/* La fila de tipos es OTRA cosa que los filtros: no la sustituye, la acompaña. */}
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
                      onPostular={(id) => void postular(id)}
                      favorito={favProyectos.includes(p.proyecto.id)}
                      onFavorito={(id) => void alternarFavorito("proyectosFavoritos", id)} />
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
