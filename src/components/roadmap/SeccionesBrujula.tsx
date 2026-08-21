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
 * Barra de rol: el relleno azul es cómo le va de verdad contra ese puesto.
 *
 * La marca del nivel esperado sólo tiene sentido en "Puesto actual", donde existe una expectativa
 * (3 de 5). En "Puesto deseado" el objetivo es cubrirlo entero, así que una marca en el 60 %
 * insinuaría que con eso basta — por eso allí se apaga y el pie manda a las brechas.
 */
export function BarraDesempeno({ pct, marca = true, nota }: {
  pct: number;
  marca?: boolean;
  nota?: string;
}) {
  const relleno = Math.round(Math.min(100, Math.max(0, pct)));
  const ESPERADO = 60; // 3 de 5
  return (
    <div className="rm-nivel" aria-label={marca ? `${relleno} % — se espera ${ESPERADO} %` : `${relleno} %`}>
      <div className="rm-nivel-barra">
        <span className="rm-nivel-relleno" style={{ width: `${relleno}%` }} />
        {marca && <span className="rm-nivel-marca fija" style={{ left: `${ESPERADO}%` }} />}
      </div>
      <span className="rm-nivel-falta">
        {nota ?? "La marca es el nivel que se espera (3 de 5)."}
      </span>
    </div>
  );
}

/** Las casillas de la barra. Cinco es la escala de niveles de toda la aplicación. */
const CASILLAS = 5;

/**
 * Una barra de cinco casillas: el relleno azul llega hasta el nivel que ya tienes y el triángulo
 * marca el que se espera de ti.
 *
 * **El relleno cae siempre en una línea divisoria**, nunca a media casilla: el ancho es
 * `nivel / 5`, no un porcentaje libre. Antes se dibujaba `actual / meta`, y eso hacía que un 2 de 3
 * y un 4 de 6 se vieran idénticos aunque no son lo mismo — ahora la escala es la misma para todas
 * las brechas y dos barras se comparan de un vistazo.
 *
 * El nivel esperado no es la meta a secas: cuando faltan cuatro niveles, esperarlos todos de golpe
 * no es una expectativa, es un deseo. Se pide **como mucho dos por delante**, que es lo que cabe en
 * un ciclo, y la meta completa sigue escrita con todas sus letras en el pie.
 */
export function NivelBarra({ actual, meta, compacta = false }: {
  actual: number;
  meta: number;
  /** Sin rótulos: la usan las tarjetas de rol, que ya enseñan el número encima. */
  compacta?: boolean;
}) {
  const nivel = Math.max(0, Math.min(CASILLAS, Math.round(actual)));
  const tope = Math.max(0, Math.min(CASILLAS, Math.round(meta)));
  const esperado = nivel >= tope ? tope : Math.min(tope, nivel + 2);
  const cumplido = nivel >= esperado;
  const faltan = Math.round((meta - actual) * 10) / 10;

  const pct = (nivel / CASILLAS) * 100;
  const pctEsp = (esperado / CASILLAS) * 100;

  /*
   * Centrar sobre el triángulo funciona en todas partes menos en los extremos: en el nivel 0 y en el
   * 5, un `translateX(-50%)` deja la mitad fuera de la barra —y la barra recorta—, así que ahí se
   * ancla al borde. Vale para el rótulo y para el propio triángulo.
   */
  const enBorde = pctEsp <= 0 ? { left: 0 } : pctEsp >= 100 ? { right: 0 } : null;
  const posicion = enBorde ?? { left: `${pctEsp}%`, transform: "translateX(-50%)" };

  return (
    <div className="rm-nivel" aria-label={`Nivel ${nivel} de ${CASILLAS}; se espera ${esperado}`}>
      {!compacta && (
        <div className="rm-nivel-cab">
          <span>Nivel actual: <b>{nivel}</b></span>
          <span className={"rm-estado " + (cumplido ? "ok" : "curso")}>
            {cumplido ? "Cumplido" : "En desarrollo"}
          </span>
        </div>
      )}

      <div className="rm-nivel-rotulo">
        <span style={posicion}>nivel esperado: {esperado}</span>
      </div>

      <div className="rm-nivel-barra">
        <span className="rm-nivel-relleno" style={{ width: `${pct}%` }} />
        {/* Las cuatro divisiones interiores. Las que quedan DENTRO del relleno se pintan claras: un
            tinte oscuro sobre el azul no se distingue, y sin ellas no se puede contar en qué casilla
            cae la barra, que es justo lo que esta barra existe para decir. */}
        {Array.from({ length: CASILLAS - 1 }, (_, i) => (
          <span
            key={i}
            className={"rm-nivel-div" + (i + 1 < nivel ? " sobre" : "")}
            style={{ left: `${((i + 1) / CASILLAS) * 100}%` }}
          />
        ))}
        {/* Cuando el esperado ya está alcanzado, el triángulo cae sobre el relleno: navy sobre
            azul no se ve, así que ahí se pinta blanco. */}
        <span
          className={"rm-nivel-marca" + (esperado <= nivel && nivel > 0 ? " sobre" : "")}
          style={posicion}
        />
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
          <BarraDesempeno
            pct={camino.compatibilidad}
            marca={false}
            nota="Abajo, en tus brechas, está el desglose de lo que pide."
          />
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

type Filtro = "todas" | "pendientes" | "cumplidas";

const FILTROS: Record<Filtro, string> = {
  todas: "Todas",
  pendientes: "Pendientes",
  cumplidas: "Cumplidas",
};

export function ListaBrechas({ hitos }: { hitos: Hito[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abierto, setAbierto] = useState<string | null>(
    hitos.find((h) => h.estado === "actual")?.id ?? null,
  );

  /*
   * Las cumplidas se quedan en la lista, pero DETRÁS. Ocultarlas dejaba la barra sin un solo
   * "Cumplido" en verde —el estado nunca llegaba a verse— y borraba el trabajo ya hecho de la única
   * pantalla donde se mide. Ordenadas así, lo que falta sigue abriendo la sección.
   */
  const ordenados = useMemo(() => {
    const pendiente = (h: Hito) => (h.estado === "cumplido" ? 1 : 0);
    return [...hitos].sort((a, b) => pendiente(a) - pendiente(b));
  }, [hitos]);

  const pendientes = ordenados.filter((h) => h.estado !== "cumplido");

  const visibles = useMemo(
    () => ordenados.filter((h) => filtro === "todas"
      || (filtro === "cumplidas") === (h.estado === "cumplido")),
    [ordenados, filtro],
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
        {(Object.keys(FILTROS) as Filtro[]).map((f) => (
          <button key={f} className={"rm-filtro" + (filtro === f ? " on" : "")} onClick={() => setFiltro(f)}>
            {FILTROS[f]}
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
                  <span className={`rm-punto ${h.estado}`} />
                  <div>
                    <h3>{h.titulo}</h3>
                    <span>{CAMPO[h.campo]} · {ESTADO[h.estado]}</span>
                  </div>
                </div>
                {/*
                 * Aquí iban dos cosas que se quitaron a propósito: el tamaño de la brecha ("-4"),
                 * que se leía como una calificación, y el chip de prioridad. El estado de la barra
                 * —"En desarrollo" o "Cumplido"— ya dice lo único que hay que decidir aquí.
                 */}
                <div className="rm-brecha-der">
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
