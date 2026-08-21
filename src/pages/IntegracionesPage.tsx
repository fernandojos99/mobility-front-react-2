/**
 * Pantalla `/yo` — Perfil de personas.
 *
 * El diseño es una copia EXACTA de `perfil-de-personas/components/profile-page.tsx`: la barra
 * superior con el logo de Grupo Salinas, la barra de título, el hero con el banner y "Talento GS",
 * la lista de cuatro accesos y las tarjetas con la forma de su `ExperienceCard`. La traducción de
 * Tailwind a CSS está en `components/perfil/gs.css`, clase por clase.
 *
 * Sobre esa base se añade lo que el componente no traía: la barra de "perfil completo", las tres
 * integraciones (CV, GS, LinkedIn) reducidas a botones, las seis secciones editables que guardan
 * cada una por su cuenta, y el resumen.
 *
 * La pieza que NO se toca es el DIFF de las integraciones: enseñar qué campos cambió cada fuente es
 * lo que hace que el colaborador se fíe de lo que acaba de pasar.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Ellipsis, Lock } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { useData } from "../store/DataProvider";
import { useSesion } from "../contexts/SesionContext";
import { useYo } from "../hooks/useYo";
import { CabeceraGS, ICONOS_GRUPO, type GrupoPerfil } from "../components/perfil/CabeceraGS";
import type { Fuente } from "../components/perfil/HeroPerfilGS";
import { ResumenPerfil } from "../components/perfil/ResumenPerfil";
import { TarjetaPerfil, type CampoDef, type Registro } from "../components/perfil/TarjetaPerfil";
import "../components/perfil/gs.css";
import type {
  Colaborador, Completitud, FuenteIntegracion, ResultadoIntegracion,
} from "../types/domain";

/** Lo que `AppShell` pasa por el `Outlet`: el botón de menú del componente abre el sidebar real. */
interface ContextoShell { abrirMenu: () => void }

/* `gs` ya no tiene botón, pero el backend la sigue sirviendo y el diff puede llegar con ella. */
const ETIQUETA: Record<FuenteIntegracion, string> = {
  cv: "tu CV",
  gs: "GS",
  linkedin: "LinkedIn",
  lms: "Universidad Grupo",
};

/*
 * Los `?? []` de más abajo no son paranoia: `logros` e `intereses` son campos nuevos, y un
 * colaborador servido por un backend viejo llega sin ellos. Sin la guarda, la tarjeta revienta al
 * leer `registros.length` en vez de enseñar su estado vacío.
 */

/**
 * Campos del dominio que exige el backend y que la tarjeta no pregunta.
 *
 * `motivo` y `tipo` son enums en `crudSchemas.ts`: una cadena vacía los hace fallar con 400. Se
 * rellenan aquí, en la frontera, en vez de ensuciar el formulario con un campo que a la persona no
 * le dice nada.
 */
const NORMALIZA: Record<string, (r: Registro) => Registro> = {
  historialPuestos: (r) => ({ ...r, motivo: r.motivo || "movilidad", hasta: r.hasta ?? "" }),
  cursos: (r) => ({ ...r, tipo: r.tipo || "curso" }),
};

export function IntegracionesPage() {
  const yo = useYo();
  const { abrirMenu } = useOutletContext<ContextoShell>();
  const { actualizarColaborador, catalogos, puestoDe } = useData();
  const { toast } = useSesion();
  const [cargando, setCargando] = useState<Fuente | null>(null);
  const [resultado, setResultado] = useState<ResultadoIntegracion | null>(null);
  const [completitud, setCompletitud] = useState<Completitud | null>(null);
  const [error, setError] = useState("");
  /** El snackbar inferior del componente original. */
  const [aviso, setAviso] = useState<string | null>(null);
  const hoja = useRef<HTMLDivElement>(null);
  /* Varios grupos pueden estar abiertos a la vez, así que es un conjunto y no un índice. */
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  const alternar = (id: string): void =>
    setAbiertos((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });

  /** "Agregar Manual": abre los tres grupos y baja a ellos. */
  const abrirTodos = (): void => {
    setAbiertos(new Set(["personal", "profesional", "empleo"]));
    setTimeout(
      () => hoja.current?.querySelector(".gs-lista")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60,
    );
  };

  const refrescarCompletitud = useCallback(async (id: number) => {
    try { setCompletitud(await colaboradorService.completitud(id)); } catch { /* se ignora: es informativo */ }
  }, []);

  useEffect(() => {
    if (yo) void refrescarCompletitud(yo.id);
  }, [yo, refrescarCompletitud]);

  if (!yo) return null;



  const conectar = async (fuente: Fuente) => {
    setCargando(fuente);
    setError("");
    setResultado(null);
    // Dos segundos de espera deliberados: sin ellos el "análisis" es instantáneo y no se cree.
    await new Promise((r) => setTimeout(r, fuente === "cv" ? 2000 : 900));
    try {
      const res = await colaboradorService.integrar(yo.id, fuente);
      setResultado(res);
      actualizarColaborador(res.colaborador);
      await refrescarCompletitud(yo.id);
      toast(res.mensaje);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con la fuente");
    } finally {
      setCargando(null);
    }
  };

  /**
   * Guarda UNA sección. `PUT /colaboradores/:id` hace merge parcial, así que mandar sólo el campo
   * de esta tarjeta no pisa nada más del colaborador.
   */
  const guardar = async (campo: keyof Colaborador, registros: Registro[]): Promise<void> => {
    const normaliza = NORMALIZA[campo];
    const limpios = normaliza ? registros.map(normaliza) : registros;
    const actualizado = await colaboradorService.actualizar(
      yo.id,
      { [campo]: limpios } as unknown as Partial<Colaborador>,
    );
    actualizarColaborador(actualizado);
    await refrescarCompletitud(yo.id);
    toast("Se guardó tu información.");
  };

  const cat = catalogos;

  /** Cada tarjeta, ya construida, para poder repartirlas entre los tres grupos. */
  const tarjetas = {
    educacion: (
      <TarjetaPerfil
        titulo="Formación académica"
        campos={CAMPOS_EDUCACION}
        registros={(yo.educacion ?? []) as unknown as Registro[]}
        fila={(r) => ({
          titulo: String(r.institucion ?? ""),
          sub: String(r.titulo ?? ""),
          meta: [r.inicio, r.fin].filter(Boolean).join(" – "),
        })}
                ayuda={[
          "Tu nivel de estudios se compara contra el que pide cada puesto, y esa comparación es uno " +
          "de los pasos de tu camino: si el puesto pide licenciatura y no la tienes registrada, " +
          "aparece como pendiente aunque la hayas terminado.",
          "Por eso importa capturarla aunque te parezca obvia. Si sigues estudiando, deja vacío el " +
          "año de conclusión.",
        ]}
        onGuardar={(rs) => guardar("educacion", rs)}
      />
    ),
    gs: (
      <TarjetaPerfil
        titulo="Experiencia en Grupo Salinas"
        campos={camposGrupoSalinas(cat?.negocios ?? [], cat?.areas ?? [])}
        registros={(yo.historialPuestos ?? []) as unknown as Registro[]}
        fila={(r) => ({
          titulo: String(r.puesto ?? ""),
          sub: [r.negocio, r.areaPrincipal].filter(Boolean).join(" · "),
          meta: `${r.desde ?? ""} – ${r.hasta || "Actual"}`,
        })}
                ayuda={[
          "De aquí sale tu antigüedad, que es una de las dos reglas que pueden bloquear una " +
          "postulación: la fecha de inicio de tu puesto actual es la que cuenta.",
          "También alimenta la regla de escalafón — hay puestos a los que sólo se llega habiendo " +
          "ocupado otro antes—, así que conviene que estén todos, no sólo el último.",
          "Deja la fecha final vacía en el puesto que ocupas hoy.",
        ]}
        onGuardar={(rs) => guardar("historialPuestos", rs)}
      />
    ),
    externa: (
      <TarjetaPerfil
        titulo="Experiencia externa"
        campos={CAMPOS_EXTERNA}
        registros={(yo.experiencia ?? []) as unknown as Registro[]}
        fila={(r) => ({
          titulo: String(r.puesto ?? ""),
          sub: String(r.empresa ?? ""),
          meta: [r.inicio, r.fin].filter(Boolean).join(" – "),
        })}
                ayuda={[
          "Lo que hiciste fuera del grupo. Suma a tus años de experiencia, que es lo que se compara " +
          "contra los que pide cada puesto.",
          "No cuenta para la antigüedad interna ni para el escalafón: para eso está la sección de " +
          "experiencia en Grupo Salinas.",
        ]}
        onGuardar={(rs) => guardar("experiencia", rs)}
      />
    ),
    logros: (
      <TarjetaPerfil
        titulo="Logros"
        campos={camposLogros(cat?.tiposProyecto ?? [], cat?.sectores ?? [])}
        registros={(yo.logros ?? []) as unknown as Registro[]}
        fila={(r) => ({
          titulo: String(r.nombre ?? ""),
          sub: [r.tipo, r.sector].filter(Boolean).join(" · "),
          meta: String(r.kpi ?? ""),
          texto: String(r.descripcion ?? ""),
        })}
                ayuda={[
          "Un logro es algo que conseguiste y que se puede medir. Por eso se pide un KPI con número: " +
          "«mejoré la atención» no dice nada, «bajé el tiempo de cierre un 30 %» sí.",
          "Es lo que convierte tu experiencia en evidencia comprobable, que es justo lo que miran " +
          "cuando compites por un puesto con alguien de perfil parecido.",
        ]}
        onGuardar={(rs) => guardar("logros", rs)}
      />
    ),
    intereses: (
      <TarjetaPerfil
        titulo="Intereses"
        campos={camposIntereses(cat?.interesesProfesionales ?? [])}
        registros={(yo.intereses ?? []) as unknown as Registro[]}
        fila={(r) => ({ titulo: String(r.interesProfesional ?? ""), texto: String(r.motivo ?? "") })}
                ayuda={[
          "Hacia dónde te quieres mover y por qué. No se compara contra nada ni afecta tu " +
          "compatibilidad: es para que tu formador sepa qué proponerte.",
          "El motivo importa tanto como el interés — es la diferencia entre que te ofrezcan " +
          "cualquier proyecto del área o justo el que te acerca a donde quieres llegar.",
        ]}
        onGuardar={(rs) => guardar("intereses", rs)}
      />
    ),
    certificaciones: (
      <TarjetaPerfil
        titulo="Certificaciones / Diplomados"
        campos={camposCertificaciones(cat?.tiposCurso ?? [])}
        registros={(yo.cursos ?? []) as unknown as Registro[]}
        fila={(r) => ({
          titulo: String(r.nombre ?? ""),
          sub: [r.tipo, r.institucion].filter(Boolean).join(" · "),
          meta: [r.fecha ? `Expedido ${r.fecha}` : "", r.caducidad ? `Caduca ${r.caducidad}` : ""]
            .filter(Boolean).join(" · "),
        })}
                ayuda={[
          "Cursos, certificados, diplomados y licencias. Junto con los proyectos laterales son la " +
          "evidencia que piden los puestos con equipo a cargo.",
          "Una certificación caducada no se borra de tu historial, pero deja de contar como " +
          "evidencia vigente. Si la tuya no caduca, deja esa fecha vacía.",
        ]}
        onGuardar={(rs) => guardar("cursos", rs)}
      />
    ),
  };

  /** Los tres accesos y lo que guarda cada uno. */
  const grupos: GrupoPerfil[] = [
    {
      id: "personal", label: "Actualiza tu información personal", icon: ICONOS_GRUPO.personal,
      contenido: tarjetas.intereses,
    },
    {
      id: "profesional", label: "Actualiza tu perfil profesional", icon: ICONOS_GRUPO.profesional,
      contenido: <>{tarjetas.educacion}{tarjetas.logros}{tarjetas.certificaciones}</>,
    },
    {
      id: "empleo", label: "Información de empleo", icon: ICONOS_GRUPO.empleo,
      contenido: <>{tarjetas.gs}{tarjetas.externa}</>,
    },
  ];

  return (
    <div className="gs-fondo">
      <div className="gs" ref={hoja}>
        <CabeceraGS
          yo={yo}
          puesto={puestoDe(yo.puestoActualId)}
          grupos={grupos}
          abiertos={abiertos}
          onAlternar={alternar}
          onMenu={abrirMenu}
          onFuente={conectar}
          cargandoFuente={cargando}
          onManual={abrirTodos}
          /* La barra de completitud va ENTRE el hero y la lista de accesos. */
          barraCompletitud={completitud && (
            <section className="gs-card" aria-labelledby="sec-completo">
              <div className="gs-progreso-cab">
                <b id="sec-completo">Perfil completo</b>
                <span>{completitud.porcentaje}%</span>
              </div>
              <div className={"gs-progreso" + (completitud.porcentaje >= 90 ? " ok" : "")}>
                <i style={{ width: `${completitud.porcentaje}%` }} />
              </div>
              {completitud.faltantes.length > 0 && (
                <div className="gs-faltantes">
                  {completitud.faltantes.map((f) => <span className="gs-faltante" key={f}>{f}</span>)}
                </div>
              )}
            </section>
          )}
        />

        {error && (
          <section className="gs-card">
            <p className="gs-error" style={{ marginTop: 0 }}>{error}</p>
          </section>
        )}

        {resultado && (
          <section className="gs-card" aria-labelledby="sec-diff">
            <div className="gs-card-cab">
              <h3 id="sec-diff">Lo que cambió con {ETIQUETA[resultado.fuente]}</h3>
            </div>
            {resultado.cambios.length === 0 ? (
              <p className="gs-consejo">{resultado.mensaje}</p>
            ) : (
              resultado.cambios.map((c) => (
                <div key={c.campo} className="gs-diff-fila">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="gs-registro-tit">{c.etiqueta}</div>
                    <div className="gs-diff-antes"><s>{c.antes}</s></div>
                    <div className="gs-diff-despues">{c.despues}</div>
                  </div>
                  {resultado.bloqueados.includes(c.campo) && (
                    <span className="gs-faltante"><Lock size={10} style={{ verticalAlign: "-1px" }} /> viene de GS</span>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        <ResumenPerfil yo={yo} />

        {/* El snackbar inferior del componente original. */}
        {aviso && (
          <div className="gs-snack" role="status">
            <span>{aviso}</span>
            <button onClick={() => setAviso(null)} aria-label="Cerrar mensaje"><Ellipsis size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────── Descriptores de campo ──────────────────────────
 * Las opciones de todos los `select` salen de `catalogos`, nunca de una lista escrita aquí:
 * el front no define ni una sola lista de dominio.
 */

const CAMPOS_EDUCACION: CampoDef[] = [
  { clave: "institucion", tipo: "texto", etiqueta: "Institución educativa", consejo: "Nombre completo. P. ej. Universidad Nacional Autónoma de México" },
  { clave: "titulo", tipo: "texto", etiqueta: "Grado", consejo: "El grado que obtuviste. P. ej. Licenciatura en Administración" },
  // Años, no fechas: en el expediente académico basta el año y así se captura más rápido.
  { clave: "inicio", tipo: "texto", etiqueta: "Año de inicio", consejo: "Sólo el año. P. ej. 2015" },
  { clave: "fin", tipo: "texto", etiqueta: "Año de conclusión", consejo: "Sólo el año. Déjalo vacío si sigues estudiando" },
];

const camposGrupoSalinas = (negocios: string[], areas: string[]): CampoDef[] => [
  { clave: "negocio", tipo: "select", etiqueta: "Negocio / despacho", opciones: negocios, consejo: "El negocio del grupo donde estuviste. Si no lo eliges, queda como No seleccionado" },
  { clave: "areaPrincipal", tipo: "select", etiqueta: "Principal área de experiencia", opciones: areas, consejo: "El área donde pasaste la mayor parte del tiempo" },
  { clave: "puesto", tipo: "texto", etiqueta: "Puesto", consejo: "Como aparece en tu nombramiento. P. ej. Coordinadora comercial" },
  { clave: "areas", tipo: "lista", etiqueta: "Áreas", consejo: "Otras áreas en las que participaste durante ese periodo" },
  { clave: "desde", tipo: "fecha", etiqueta: "Fecha de inicio", consejo: "El día que empezaste en el puesto" },
  { clave: "hasta", tipo: "fecha", etiqueta: "Fecha final", consejo: "Déjala vacía si es tu puesto actual" },
];

const CAMPOS_EXTERNA: CampoDef[] = [
  { clave: "puesto", tipo: "texto", etiqueta: "Puesto", consejo: "El cargo que ocupabas. P. ej. Ejecutiva de cuenta" },
  { clave: "empresa", tipo: "texto", etiqueta: "Empresa", consejo: "Nombre de la empresa, fuera de Grupo Salinas" },
  { clave: "inicio", tipo: "fecha", etiqueta: "Fecha de inicio", consejo: "El día que entraste" },
  { clave: "fin", tipo: "fecha", etiqueta: "Fecha final", consejo: "El día que saliste" },
];

const camposLogros = (tipos: string[], sectores: string[]): CampoDef[] => [
  { clave: "nombre", tipo: "texto", etiqueta: "Nombre", consejo: "Nómbralo como se lo contarías a alguien. P. ej. Rediseño del arqueo de caja" },
  { clave: "tipo", tipo: "select", etiqueta: "Tipo", opciones: tipos, consejo: "Qué clase de logro fue" },
  { clave: "sector", tipo: "select", etiqueta: "Sector", opciones: sectores, consejo: "El sector al que pertenece" },
  { clave: "descripcion", tipo: "textarea", etiqueta: "Descripción", consejo: "Qué problema había y qué hiciste. Dos o tres líneas bastan" },
  { clave: "responsabilidades", tipo: "lista", etiqueta: "Responsabilidades", consejo: "Una por línea. Lo que estuvo en tus manos, no lo del equipo entero" },
  { clave: "kpi", tipo: "texto", etiqueta: "KPI o métrica asociada", consejo: "Con número, o no dice nada. P. ej. Minutos de cierre de caja (−30 %)" },
];

const camposIntereses = (intereses: string[]): CampoDef[] => [
  { clave: "interesProfesional", tipo: "select", etiqueta: "Interés profesional", opciones: intereses, consejo: "Hacia dónde te interesa crecer" },
  { clave: "motivo", tipo: "textarea", etiqueta: "Motivo", consejo: "Por qué te interesa. Ayuda a tu formador a proponerte proyectos" },
];

const camposCertificaciones = (tipos: string[]): CampoDef[] => [
  { clave: "nombre", tipo: "texto", etiqueta: "Nombre del estudio", consejo: "Como aparece en el documento. P. ej. Scrum Master certificado" },
  { clave: "tipo", tipo: "select", etiqueta: "Tipo de estudio", opciones: tipos, consejo: "Curso, certificado, diplomado o licencia" },
  { clave: "institucion", tipo: "texto", etiqueta: "Institución", consejo: "Quién lo expidió. P. ej. Universidad Grupo" },
  { clave: "fecha", tipo: "fecha", etiqueta: "Fecha de expedición", consejo: "El día que te lo entregaron" },
  { clave: "caducidad", tipo: "fecha", etiqueta: "Fecha de caducidad", consejo: "Déjala vacía si no caduca" },
];

