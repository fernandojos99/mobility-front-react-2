/**
 * Las tarjetas del perfil de talento, portadas del dashboard `employee-performance-dashboard`.
 *
 * Se conserva su ESTRUCTURA (tabla de evaluaciones con termómetro, psicometrías, escala de
 * felicidad, valores, aprendizaje, coaching) y se cambia la piel: aquí manda el azul #087ee8 y los
 * grises de `/yo`, no el marino y el carmesí del original. Ver `talento.css`.
 *
 * Van todas en un archivo porque son piezas de presentación cortas de la MISMA pantalla: repartirlas
 * en siete ficheros de veinte líneas costaría más de lo que aclara.
 */
import type { ReactNode } from "react";
import { Activity, Award, BookOpen, CircleHelp, HeartPulse, Lightbulb, Target, TrendingUp } from "lucide-react";
import { GraficaIpn } from "./GraficaIpn";
import type { LineaAprendizaje, Psicometria, PuntoIpn, Talento, ValorInstitucional } from "../../types/domain";

/** Tarjeta con la cabecera de sección del original: cuadro de icono + título. */
function Tarjeta({ icono, titulo, extra, children, className = "" }: {
  icono: ReactNode;
  titulo: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`gs-card ${className}`} style={{ margin: 0 }}>
      <div className="tl-tit">
        <span className="tl-icono">{icono}</span>
        <h3>{titulo}</h3>
        {extra ?? (
          <button className="gs-ayuda" aria-label={`Ayuda sobre ${titulo.toLowerCase()}`}>
            <CircleHelp size={15} strokeWidth={2} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Tono de una píldora de nivel. Se decide por POSICIÓN en la escala, no por el texto: así, si mañana
 * se añade un escalón al catálogo, los colores siguen cuadrando.
 */
function tono(valor: string, escala: string[]): string {
  const i = escala.indexOf(valor);
  if (i < 0) return "medio";
  const t = i / Math.max(1, escala.length - 1);
  return t >= 0.6 ? "alto" : t >= 0.3 ? "medio" : "bajo";
}

export function TarjetaDesempeno({ t, escala }: { t: Talento; escala: string[] }) {
  // La marca del termómetro va en la evaluación más reciente.
  const ultima = t.evaluaciones[t.evaluaciones.length - 1];
  const idx = ultima ? escala.indexOf(ultima.desempeno) : -1;
  const pct = idx < 0 ? 50 : (idx / Math.max(1, escala.length - 1)) * 100;

  return (
    <Tarjeta icono={<TrendingUp size={16} strokeWidth={2.5} />} titulo="Desempeño">
      <div className="tl-tabla">
        <div className="tl-tabla-cab">
          <span>Año</span><span>Desempeño</span><span>Objetivos</span><span>Comportamientos</span>
        </div>
        {t.evaluaciones.map((e) => (
          <div className="tl-tabla-fila" key={e.anio}>
            <strong>{e.anio}</strong>
            <span className={`tl-nivel ${tono(e.desempeno, escala)}`}>{e.desempeno}</span>
            <span className={`tl-nivel ${tono(e.objetivos, escala)}`}>{e.objetivos}</span>
            <span className={`tl-nivel ${tono(e.comportamientos, escala)}`}>{e.comportamientos}</span>
          </div>
        ))}
      </div>
      <div className="tl-escala" aria-label="Escala de evaluación de desempeño">
        <div className="tl-barra"><span className="tl-marca" style={{ left: `${pct}%` }} /></div>
        <div className="tl-escala-rot">
          {escala.map((e) => <span key={e}>{e}</span>)}
        </div>
      </div>
    </Tarjeta>
  );
}

export function TarjetaIpn({ ipn }: { ipn: PuntoIpn[] }) {
  return (
    <Tarjeta icono={<Activity size={16} strokeWidth={2.5} />} titulo="IPN">
      <GraficaIpn puntos={ipn} />
    </Tarjeta>
  );
}

export function TarjetaPsicometrias({ ps }: { ps: Psicometria[] }) {
  return (
    <Tarjeta icono={<Lightbulb size={16} strokeWidth={2.5} />} titulo="Psicometrías">
      <div className="tl-psico">
        {ps.map((p) => (
          <div key={p.instrumento}>
            <b>{p.instrumento}</b>
            <span>{p.rasgos.join(" · ")}</span>
          </div>
        ))}
      </div>
    </Tarjeta>
  );
}

/** La felicidad NO tiene campo propio: es el último punto del IPN, como en el dashboard original. */
export function TarjetaFelicidad({ ipn }: { ipn: PuntoIpn[] }) {
  const ultimo = ipn[ipn.length - 1];
  if (!ultimo) return null;
  return (
    <Tarjeta icono={<HeartPulse size={16} strokeWidth={2.5} />} titulo="Felicidad">
      <div className="tl-metrica">
        <div><span>IPN actual · {ultimo.periodo}</span><strong>{ultimo.valor}%</strong></div>
        <div className="tl-escala" aria-label="Escala de felicidad">
          <div className="tl-barra" style={{ height: "0.75rem" }}>
            <span className="tl-marca" style={{ left: `${ultimo.valor}%` }} />
          </div>
          <div className="tl-escala-rot">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>
        <small>Promedio de satisfacción</small>
      </div>
    </Tarjeta>
  );
}

export function TarjetaValores({ valores, niveles }: { valores: ValorInstitucional[]; niveles: string[] }) {
  return (
    <Tarjeta icono={<Award size={16} strokeWidth={2.5} />} titulo="Valores">
      <div className="tl-valores">
        {valores.map((v) => (
          <div key={v.nombre}>
            <span>{v.nombre}</span>
            <b className={`tl-nivel ${tono(v.nivel, niveles)}`}>{v.nivel}</b>
          </div>
        ))}
      </div>
    </Tarjeta>
  );
}

export function TarjetaAprendizaje({ lineas }: { lineas: LineaAprendizaje[] }) {
  return (
    <Tarjeta icono={<BookOpen size={16} strokeWidth={2.5} />} titulo="Aprendizaje">
      <div className="tl-aprend">
        {lineas.map((l) => (
          <div key={l.categoria}>
            <span>{l.categoria}</span>
            <b>{l.finalizados}</b>
            <b className="pend">{l.pendientes}</b>
          </div>
        ))}
      </div>
      <div className="tl-leyenda"><span>Finalizado</span><span>Pendiente</span></div>
    </Tarjeta>
  );
}

export function TarjetaCoaching({ coaching, mentoring }: { coaching: number; mentoring: number }) {
  return (
    <Tarjeta icono={<Target size={16} strokeWidth={2.5} />} titulo="Coaching y mentoring">
      <div className="tl-mini">
        <div><span>Coaching</span><strong>{coaching}</strong></div>
        <div><span>Mentoring</span><strong>{mentoring}</strong></div>
      </div>
    </Tarjeta>
  );
}
