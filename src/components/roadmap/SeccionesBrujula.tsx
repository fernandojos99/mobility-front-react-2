/**
 * Las secciones de la "Brújula", portadas de `roadmap/career-progression-dashboard`.
 *
 * Se copia la estructura y las medidas; la paleta es la de `/yo` (ver `roadmap.css`). Del original
 * se descartan su barra superior, su fila de bienvenida y su navegación inferior: la aplicación ya
 * tiene sidebar y su propio hero de perfil.
 *
 * TODO sale del mismo `Camino` que pinta el mapa de `/yo/camino/:puestoId`. Ese es el requisito:
 * lo que se lee aquí y lo que se ve animado allá tienen que ser la misma cosa.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BriefcaseBusiness, ChevronDown, ChevronUp, Flag, Lock, MapPinned, Sparkles, Target, Zap,
} from "lucide-react";
import type { Camino, Hito } from "../../types/domain";

/** Los cinco puntitos de nivel del original. `gris` distingue el nivel de hoy del de la meta. */
export function NivelDots({ valor, gris = false }: { valor: number; gris?: boolean }) {
  return (
    <div className="rm-dots" aria-label={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((d) => (
        <span key={d} className={d <= valor ? (gris ? "on gris" : "on") : ""} />
      ))}
    </div>
  );
}

const CAMPO: Record<Hito["campo"], string> = {
  capacidades: "Capacidades",
  estudios: "Estudios",
  puestos: "Escalafón",
  historial: "Historial",
  desempeno: "Desempeño",
};

const ESTADO: Record<Hito["estado"], string> = {
  cumplido: "Cumplido",
  actual: "Tu siguiente paso",
  bloqueado: "Bloqueado",
};

/** Promedio 1–5, redondeado a un decimal como en el mockup ("2.8 / 5"). */
const promedio = (ns: number[]): number =>
  ns.length ? Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10) / 10 : 0;

/* ────────────────────────── Hero ────────────────────────── */

export function HeroBrujula({ camino }: { camino: Camino }) {
  const pendientes = camino.hitos.filter((h) => h.estado !== "cumplido").length;
  return (
    <section className="rm-hero" aria-label="Resumen de progreso">
      <div className="rm-hero-top">
        <div>
          <p className="rm-kicker">Tu avance hacia</p>
          <h2>{camino.puestoObjetivoTitulo}</h2>
        </div>
        <div className="rm-hero-icono"><Target size={24} /></div>
      </div>

      <div className="rm-hero-prog">
        <div>
          <strong>{camino.avance}%</strong>
          <span>de preparación</span>
        </div>
        <div className="rm-barra-caja">
          <div className="rm-barra"><span style={{ width: `${camino.avance}%` }} /></div>
          <div className="rm-barra-rot"><span>Hoy</span><span>Meta</span></div>
        </div>
      </div>

      <p className="rm-hero-nota">
        <Sparkles size={15} style={{ flexShrink: 0 }} />
        {pendientes === 0 ? (
          <span>Cubres todo lo que pide el puesto. <strong>Estás listo para postularte.</strong></span>
        ) : (
          <span>
            Te {pendientes === 1 ? "falta" : "faltan"}{" "}
            <strong>{pendientes} {pendientes === 1 ? "hito" : "hitos"}</strong> para dar el siguiente salto.
          </span>
        )}
      </p>
    </section>
  );
}

/* ────────────────────────── Comparación de roles ────────────────────────── */

export function ComparacionRoles({ camino, puestoActual, areaActual, antiguedad, selector }: {
  camino: Camino;
  puestoActual: string;
  areaActual: string;
  antiguedad: string;
  selector: ReactNode;
}) {
  // Los dos promedios salen de los MISMOS hitos que se listan debajo: por eso cuadran.
  const hoy = promedio(camino.hitos.map((h) => h.nivelActual));
  const meta = promedio(camino.hitos.map((h) => h.nivelMeta));

  return (
    <section className="rm-sec">
      <div className="rm-sec-cab">
        <div>
          <p className="rm-eyebrow">COMPARA TUS ROLES</p>
          <h2>De dónde partes a dónde vas</h2>
        </div>
      </div>

      {selector}

      <div className="rm-comp">
        <div className="rm-rol">
          <div className="rm-rol-cab">
            <span className="rm-rol-estado">Puesto actual</span>
            <BriefcaseBusiness size={18} />
          </div>
          <h3>{puestoActual}</h3>
          <p>{areaActual} · {antiguedad}</p>
          <div className="rm-rol-nota">
            <span>Nivel promedio</span>
            <strong>{hoy} <small>/ 5</small></strong>
          </div>
          <NivelDots valor={Math.round(hoy)} gris />
        </div>

        <div className="rm-conector"><ArrowRight size={18} /></div>

        <div className="rm-rol meta">
          <div className="rm-rol-cab">
            <span className="rm-rol-estado">Puesto deseado</span>
            <Flag size={18} />
          </div>
          <h3>{camino.puestoObjetivoTitulo}</h3>
          <p>Compatibilidad de hoy: {camino.compatibilidad} %</p>
          <div className="rm-rol-nota">
            <span>Nivel requerido</span>
            <strong>{meta} <small>/ 5</small></strong>
          </div>
          <NivelDots valor={Math.round(meta)} />
        </div>
      </div>

      {camino.bloqueo.bloqueado && (
        <div className="rm-bloqueo">
          <Lock size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--gs-muted-foreground)" }} />
          <div>
            <b>Todavía no puedes postularte</b>
            <p>{camino.bloqueo.mensaje}</p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ────────────────────────── Brechas ────────────────────────── */

type Filtro = "todas" | "alta" | "media";

export function ListaBrechas({ hitos }: { hitos: Hito[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abierto, setAbierto] = useState<string | null>(
    hitos.find((h) => h.estado === "actual")?.id ?? null,
  );

  /*
   * Una brecha es lo que FALTA. Listar aquí también los hitos cumplidos llenaba la sección de filas
   * "5/5 → 5/5" bajo un título que dice "lo que necesitas fortalecer", y además descuadraba la
   * cuenta con el hero ("te faltan 4 hitos" contra "13 hitos"). El camino completo, cumplidos
   * incluidos, está justo debajo en "Mi ruta" y en el mapa.
   */
  const pendientes = useMemo(() => hitos.filter((h) => h.estado !== "cumplido"), [hitos]);

  const visibles = useMemo(
    () => pendientes.filter((h) => filtro === "todas" || h.prioridad === filtro),
    [pendientes, filtro],
  );

  return (
    <section className="rm-sec">
      <div className="rm-sec-cab">
        <div>
          <p className="rm-eyebrow">TUS BRECHAS</p>
          <h2>Lo que necesitas fortalecer</h2>
        </div>
        <span className="rm-cuenta">{visibles.length} {visibles.length === 1 ? "hito" : "hitos"}</span>
      </div>

      <div className="rm-filtros" role="group" aria-label="Filtrar brechas">
        {(["todas", "alta", "media"] as const).map((f) => (
          <button key={f} className={"rm-filtro" + (filtro === f ? " on" : "")} onClick={() => setFiltro(f)}>
            {f === "todas" ? "Todas" : `Prioridad ${f}`}
          </button>
        ))}
      </div>

      {pendientes.length === 0 && (
        <p style={{ color: "var(--gs-muted-foreground)", fontSize: 13, lineHeight: 1.5 }}>
          No te falta ninguna. Cubres todo lo que pide el puesto.
        </p>
      )}

      <div className="rm-brechas">
        {visibles.map((h) => {
          const brecha = Math.max(0, h.nivelMeta - h.nivelActual);
          const open = abierto === h.id;
          return (
            <article className={"rm-brecha" + (open ? " abierta" : "")} key={h.id}>
              <button
                className="rm-brecha-trigger"
                onClick={() => setAbierto(open ? null : h.id)}
                aria-expanded={open}
              >
                <div className="rm-brecha-tit">
                  <span className={`rm-punto ${h.prioridad}`} />
                  <div>
                    <h3>{h.titulo}</h3>
                    <span>{CAMPO[h.campo]} · {ESTADO[h.estado]}</span>
                  </div>
                </div>
                <div className="rm-brecha-der">
                  <span className={`rm-prio ${h.prioridad}`}>{h.prioridad}</span>
                  <span className={"rm-gap" + (brecha === 0 ? " cero" : "")}>
                    {brecha === 0 ? "✓" : `-${brecha}`}
                  </span>
                  {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </div>
              </button>

              <div className="rm-niveles">
                <div>
                  <span>Hoy</span><strong>{h.nivelActual}/5</strong>
                  <NivelDots valor={h.nivelActual} gris />
                </div>
                <div className="rm-flecha"><ArrowRight size={15} /></div>
                <div>
                  <span>Meta</span><strong>{h.nivelMeta}/5</strong>
                  <NivelDots valor={h.nivelMeta} />
                </div>
              </div>

              {open && (
                <div className="rm-detalle">
                  <div className="rm-detalle-fila">
                    <Zap size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p>{h.descripcion}</p>
                  </div>
                  {h.comoCumplirlo.length > 0 && (
                    <ul>{h.comoCumplirlo.map((paso) => <li key={paso}>{paso}</li>)}</ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ────────────────────────── Ruta ────────────────────────── */

export function RutaPasos({ camino }: { camino: Camino }) {
  const hechos = camino.hitos.filter((h) => h.estado === "cumplido").length;

  return (
    <section className="rm-sec" id="ruta">
      <div className="rm-sec-cab">
        <div>
          <p className="rm-eyebrow">MI RUTA</p>
          <h2>Pequeños pasos, gran avance</h2>
        </div>
        <span className="rm-cuenta">{hechos}/{camino.hitos.length} listos</span>
      </div>

      <div className="rm-ruta">
        {camino.hitos.map((h, i) => (
          <article className={`rm-paso ${h.estado === "cumplido" ? "hecho" : h.estado}`} key={h.id}>
            {/* No es un botón: el estado de un hito lo calcula el backend en cada consulta y no se
                guarda, así que una casilla pulsable se desharía sola al recargar. */}
            <div className="rm-paso-num">{h.estado === "cumplido" ? "✓" : i + 1}</div>
            <div className="rm-paso-cuerpo">
              <div className="rm-paso-meta">
                <span>{CAMPO[h.campo]}</span>
                <small>{ESTADO[h.estado]}</small>
              </div>
              <h3>{h.titulo}</h3>
              <p>{h.descripcion}</p>
            </div>
          </article>
        ))}
      </div>

      {/* El mapa enseña exactamente estos mismos hitos, sólo que animados. */}
      <Link to={`/yo/camino/${camino.puestoObjetivoId}`} className="rm-destino-btn" style={{ marginTop: 4 }}>
        <MapPinned size={16} style={{ flexShrink: 0, color: "var(--rm-primary)" }} />
        <span>Ver mi camino</span>
        <ArrowRight size={15} />
      </Link>
    </section>
  );
}
