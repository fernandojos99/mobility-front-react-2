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

/**
 * Una ÚNICA barra azul que va de donde estás a donde pide el puesto.
 *
 * Antes eran dos barras separadas —"Hoy" y "Meta"— y había que compararlas de un vistazo para
 * deducir la brecha. Ahora es una sola: el relleno azul es lo que ya tienes, lo gris es lo que
 * falta, y la flecha marca justo la frontera entre las dos.
 *
 * El porcentaje y la flecha salen del MISMO cálculo (`pct`), así que no pueden discrepar: si el
 * rótulo dice 20 %, la flecha está en el 20 % del ancho. `meta` puede ser menor que 5 —el hito de
 * desempeño pide 3—, por eso el avance se mide contra la meta y no contra un 5 fijo.
 */
/**
 * Barra de rol: la flecha se clava en el nivel que se ESPERA (3 de 5) y no se mueve; lo que varía
 * es el relleno azul, que es cómo le va de verdad.
 *
 * Así las dos tarjetas se comparan de un vistazo contra la misma referencia: en "Puesto actual" el
 * relleno es lo que cubre del puesto que ya ocupa, y en "Puesto deseado", su compatibilidad con el
 * objetivo. Si la flecha se moviera con cada tarjeta no habría nada que comparar.
 */
export function BarraDesempeno({ pct }: { pct: number }) {
  const relleno = Math.round(Math.min(100, Math.max(0, pct)));
  const ESPERADO = 60; // 3 de 5
  return (
    <div className="rm-nivel" aria-label={`${relleno} % — se espera ${ESPERADO} %`}>
      <div className="rm-nivel-barra">
        <span className="rm-nivel-relleno" style={{ width: `${relleno}%` }} />
        <span className="rm-nivel-marca fija" style={{ left: `${ESPERADO}%` }} />
      </div>
      <span className="rm-nivel-falta">
        La marca es el nivel que se espera (3 de 5).
      </span>
    </div>
  );
}

export function NivelBarra({ actual, meta, compacta = false }: {
  actual: number;
  meta: number;
  /** Sin rótulos: la usan las tarjetas de rol, que ya enseñan el número encima. */
  compacta?: boolean;
}) {
  const tope = Math.max(1, meta);
  const pct = Math.round((Math.min(actual, tope) / tope) * 100);
  const faltan = Math.round((meta - actual) * 10) / 10;

  return (
    <div className="rm-nivel" aria-label={`Nivel ${actual} de ${meta}, ${pct} %`}>
      {!compacta && (
        <div className="rm-nivel-cab">
          <span>Nivel <b>{actual}</b> de <b>{meta}</b></span>
          <span className="rm-nivel-pct">{pct} %</span>
        </div>
      )}
      <div className="rm-nivel-barra">
        <span className="rm-nivel-relleno" style={{ width: `${pct}%` }} />
        <span className="rm-nivel-marca" style={{ left: `${pct}%` }} />
      </div>
      {!compacta && faltan > 0 && (
        <span className="rm-nivel-falta">
          Te {faltan === 1 ? "falta" : "faltan"} {faltan} {faltan === 1 ? "nivel" : "niveles"} para
          lo que pide el puesto
        </span>
      )}
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
            <strong>{pendientes} {pendientes === 1 ? "paso" : "pasos"}</strong> para dar el siguiente salto.
          </span>
        )}
      </p>
    </section>
  );
}

/* ────────────────────────── Comparación de roles ────────────────────────── */

export function ComparacionRoles({ camino, puestoActual, areaActual, antiguedad, cumplimiento, selector }: {
  camino: Camino;
  puestoActual: string;
  areaActual: string;
  antiguedad: string;
  /** Qué tanto cubre el descriptivo del puesto que ocupa HOY (0–100). Viene del gap. */
  cumplimiento: number;
  selector: ReactNode;
}) {

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
            <span>Cómo te va hoy</span>
            <strong>{cumplimiento} <small>%</small></strong>
          </div>
          <BarraDesempeno pct={cumplimiento} />
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
            <span>Cómo vas para ese puesto</span>
            <strong>{camino.compatibilidad} <small>%</small></strong>
          </div>
          <BarraDesempeno pct={camino.compatibilidad} />
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
        <span className="rm-cuenta">{visibles.length} {visibles.length === 1 ? "paso" : "pasos"}</span>
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
                {/* Aquí iba el tamaño de la brecha ("-4"). Se quitó porque se leía como una
                    calificación, y además ya está contado con todas las letras debajo de la barra
                    ("Te faltan 4 niveles..."). */}
                <div className="rm-brecha-der">
                  <span className={`rm-prio ${h.prioridad}`}>{h.prioridad}</span>
                  {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </div>
              </button>

              <div className="rm-niveles">
                <NivelBarra actual={h.nivelActual} meta={h.nivelMeta} />
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
