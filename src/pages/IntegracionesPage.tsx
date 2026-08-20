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
import { useNavigate, useOutletContext } from "react-router-dom";
import { Building2, CircleHelp, Ellipsis, FileUp, Loader2, Lock } from "lucide-react";
import { colaboradorService } from "../services/colaboradorService";
import { useData } from "../store/DataProvider";
import { useSesion } from "../contexts/SesionContext";
import { useYo } from "../hooks/useYo";
import { ACCESOS, CabeceraGS } from "../components/perfil/CabeceraGS";
import { ResumenPerfil } from "../components/perfil/ResumenPerfil";
import { TarjetaPerfil, type CampoDef, type Registro } from "../components/perfil/TarjetaPerfil";
import "../components/perfil/gs.css";
import type { Colaborador, Completitud, ResultadoIntegracion } from "../types/domain";

type Fuente = "cv" | "gs" | "linkedin";

/** Lo que `AppShell` pasa por el `Outlet`: el botón de menú del componente abre el sidebar real. */
interface ContextoShell { abrirMenu: () => void }

/**
 * Logo de LinkedIn en SVG en línea. Lucide ya no trae iconos de marca, y el brief pide
 * expresamente que se vean los símbolos de cada fuente.
 */
const LogoLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const ETIQUETA: Record<Fuente, string> = { cv: "tu CV", gs: "GS", linkedin: "LinkedIn" };

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
  const navigate = useNavigate();
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

  const refrescarCompletitud = useCallback(async (id: number) => {
    try { setCompletitud(await colaboradorService.completitud(id)); } catch { /* se ignora: es informativo */ }
  }, []);

  useEffect(() => {
    if (yo) void refrescarCompletitud(yo.id);
  }, [yo, refrescarCompletitud]);

  if (!yo) return null;

  const irA = (id: string): void => {
    hoja.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  /** Los cuatro accesos del original, apuntando a sitios reales de esta aplicación. */
  const accesos = [
    { ...ACCESOS[0], onClick: () => irA("sec-educacion") },
    { ...ACCESOS[1], onClick: () => irA("sec-logros") },
    { ...ACCESOS[2], onClick: () => irA("sec-gs") },
    { ...ACCESOS[3], onClick: () => navigate("/yo/gap") },
  ];

  return (
    <div className="gs-fondo">
      <div className="gs" ref={hoja}>
        <CabeceraGS
          yo={yo}
          puesto={puestoDe(yo.puestoActualId)}
          accesos={accesos}
          onMenu={abrirMenu}
          onAccionesGenerales={() => setAviso("Todas las acciones")}
        />

        {/* Barra de perfil completo. Va ARRIBA de las tarjetas, como se pidió. */}
        {completitud && (
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

        {/* Las tres integraciones, ahora como botones pequeños. */}
        <section className="gs-card" aria-labelledby="sec-fuentes">
          <div className="gs-card-cab">
            <h3 id="sec-fuentes">Completa tu perfil por atajo</h3>
            <button className="gs-ayuda" aria-label="Ayuda sobre las fuentes">
              <CircleHelp size={15} strokeWidth={2} />
            </button>
          </div>
          <div className="gs-pie">
            <BotonFuente fuente="cv" icono={<FileUp size={13} />} texto="Sube tu CV"
              cargando={cargando} onConectar={conectar} />
            <BotonFuente fuente="gs" icono={<Building2 size={13} />} texto="Obtener información de GS"
              cargando={cargando} onConectar={conectar} />
            <BotonFuente fuente="linkedin" icono={<LogoLinkedIn />} texto="Conectar con LinkedIn"
              cargando={cargando} onConectar={conectar} />
          </div>
          <p className="gs-consejo">
            Si un dato viene de dos sitios manda <b>GS &gt; CV &gt; LinkedIn &gt; lo que escribas a
            mano</b>. Lo que trae GS queda bloqueado
            <Lock size={11} style={{ verticalAlign: "-1px", margin: "0 2px" }} /> y no se edita.
          </p>
          {error && <p className="gs-error">{error}</p>}
        </section>

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

        {/* Las seis secciones. Cada una guarda por su cuenta. */}
        <TarjetaPerfil
          id="sec-educacion"
          titulo="Formación académica"
          campos={CAMPOS_EDUCACION}
          registros={(yo.educacion ?? []) as unknown as Registro[]}
          fila={(r) => ({
            titulo: String(r.institucion ?? ""),
            sub: String(r.titulo ?? ""),
            meta: [r.inicio, r.fin].filter(Boolean).join(" – "),
          })}
          onGuardar={(rs) => guardar("educacion", rs)}
        />

        <TarjetaPerfil
          id="sec-gs"
          titulo="Experiencia en Grupo Salinas"
          campos={camposGrupoSalinas(cat?.negocios ?? [], cat?.areas ?? [])}
          registros={(yo.historialPuestos ?? []) as unknown as Registro[]}
          fila={(r) => ({
            titulo: String(r.puesto ?? ""),
            sub: [r.negocio, r.areaPrincipal].filter(Boolean).join(" · "),
            meta: `${r.desde ?? ""} – ${r.hasta || "Actual"}`,
          })}
          onGuardar={(rs) => guardar("historialPuestos", rs)}
        />

        <TarjetaPerfil
          id="sec-externa"
          titulo="Experiencia externa"
          campos={CAMPOS_EXTERNA}
          registros={(yo.experiencia ?? []) as unknown as Registro[]}
          fila={(r) => ({
            titulo: String(r.puesto ?? ""),
            sub: String(r.empresa ?? ""),
            meta: [r.inicio, r.fin].filter(Boolean).join(" – "),
          })}
          onGuardar={(rs) => guardar("experiencia", rs)}
        />

        <TarjetaPerfil
          id="sec-logros"
          titulo="Logros"
          campos={camposLogros(cat?.tiposProyecto ?? [], cat?.sectores ?? [])}
          registros={(yo.logros ?? []) as unknown as Registro[]}
          fila={(r) => ({
            titulo: String(r.nombre ?? ""),
            sub: [r.tipo, r.sector].filter(Boolean).join(" · "),
            meta: String(r.kpi ?? ""),
            texto: String(r.descripcion ?? ""),
          })}
          onGuardar={(rs) => guardar("logros", rs)}
        />

        <TarjetaPerfil
          id="sec-intereses"
          titulo="Intereses"
          campos={camposIntereses(cat?.interesesProfesionales ?? [])}
          registros={(yo.intereses ?? []) as unknown as Registro[]}
          fila={(r) => ({ titulo: String(r.interesProfesional ?? ""), texto: String(r.motivo ?? "") })}
          onGuardar={(rs) => guardar("intereses", rs)}
        />

        <TarjetaPerfil
          id="sec-certificaciones"
          titulo="Certificaciones / Diplomados"
          campos={camposCertificaciones(cat?.tiposCurso ?? [])}
          registros={(yo.cursos ?? []) as unknown as Registro[]}
          fila={(r) => ({
            titulo: String(r.nombre ?? ""),
            sub: [r.tipo, r.institucion].filter(Boolean).join(" · "),
            meta: [r.fecha ? `Expedido ${r.fecha}` : "", r.caducidad ? `Caduca ${r.caducidad}` : ""]
              .filter(Boolean).join(" · "),
          })}
          onGuardar={(rs) => guardar("cursos", rs)}
        />

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

/* ────────────────────────── Botón de fuente ────────────────────────── */

function BotonFuente({ fuente, icono, texto, cargando, onConectar }: {
  fuente: Fuente;
  icono: React.ReactNode;
  texto: string;
  cargando: Fuente | null;
  onConectar: (f: Fuente) => void;
}) {
  const ocupado = cargando === fuente;
  return (
    <button className="gs-btn-sec" disabled={cargando !== null} onClick={() => onConectar(fuente)}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {ocupado
        ? <><Loader2 size={13} className="girando" /> {fuente === "cv" ? "Analizando…" : "Conectando…"}</>
        : <>{icono} {texto}</>}
    </button>
  );
}
