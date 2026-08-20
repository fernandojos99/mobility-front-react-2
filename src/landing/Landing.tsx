/**
 * Landing pública. Estructura y gestos tomados de la landing de Radar (reveal on scroll con
 * IntersectionObserver, header que cambia al bajar, drawer móvil, y el bloque que apaga las
 * animaciones si el sistema lo pide), con el contenido y la piel de este producto.
 *
 * Va FUERA del AppShell a propósito: es la única pantalla que no es la aplicación.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X, MapPinned, Lock, Boxes, Sparkles, LineChart } from "lucide-react";
import { LoginModal } from "./LoginModal";
import "./landing.css";

const ANCLAS = [
  { href: "#como", texto: "Cómo funciona" },
  { href: "#mapa", texto: "El mapa" },
  { href: "#proyectos", texto: "Proyectos" },
];

/**
 * Reveal on scroll. Umbral 0.14 y `unobserve` al aparecer: un elemento solo se revela una vez.
 * Si el navegador no trae IntersectionObserver, se muestra todo de golpe en vez de dejar la
 * página en blanco.
 */
function useReveal() {
  useEffect(() => {
    const objetivos = Array.from(document.querySelectorAll<HTMLElement>("[data-rv]"));
    if (!("IntersectionObserver" in window)) {
      objetivos.forEach((el) => el.classList.add("in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }),
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    objetivos.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

interface Props { onIngresar: () => void; }

export function Landing({ onIngresar }: Props) {
  const [login, setLogin] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bajado, setBajado] = useState(false);
  const cabecera = useRef<HTMLElement>(null);

  useReveal();

  useEffect(() => {
    const alScroll = () => setBajado(window.scrollY > 10);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  return (
    <div className="lp">
      <header ref={cabecera} className={"lp-head" + (bajado ? " scrolled" : "")}>
        <div className="lp-wrap lp-head-in">
          <a href="#top" className="lp-logo">
            <span className="mk" aria-hidden="true">M</span>
            <b>Mapa de Carrera</b>
          </a>
          <nav className="lp-nav">
            {ANCLAS.map((a) => <a key={a.href} href={a.href}>{a.texto}</a>)}
          </nav>
          <button className="lp-cta" onClick={() => setLogin(true)}>Ingresar</button>
          <button className="lp-burger" onClick={() => setMenu(true)} aria-label="Abrir menú">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {menu && (
        <>
          <div className="mnav-bg" onClick={() => setMenu(false)} />
          <nav className="mnav">
            <button className="mnav-x" onClick={() => setMenu(false)} aria-label="Cerrar menú">
              <X size={22} />
            </button>
            {ANCLAS.map((a) => (
              <a key={a.href} href={a.href} onClick={() => setMenu(false)}>{a.texto}</a>
            ))}
            <button className="lp-cta" onClick={() => { setMenu(false); setLogin(true); }}>Ingresar</button>
          </nav>
        </>
      )}

      {/* ── Hero ── */}
      <section className="lp-hero" id="top">
        <div className="lp-wrap">
          <p className="kicker" data-rv>Movilidad interna</p>
          <h1 data-rv style={{ "--i": 1 } as React.CSSProperties}>
            Tu siguiente puesto tiene un camino.<br />Te lo enseñamos.
          </h1>
          <p className="lp-sub" data-rv style={{ "--i": 2 } as React.CSSProperties}>
            Deja de postularte a vacantes que no encajan. Mira qué te separa exactamente del puesto
            que quieres, en qué orden conseguirlo, y cuánto llevas recorrido.
          </p>
          <div className="lp-acciones" data-rv style={{ "--i": 3 } as React.CSSProperties}>
            <button className="lp-btn" onClick={() => setLogin(true)}>
              Ver mi camino <ArrowRight size={18} />
            </button>
            <a className="lp-btn ghost" href="#como">Cómo funciona</a>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="lp-sec bone" id="como">
        <div className="lp-wrap">
          <p className="kicker" data-rv>En tres pasos</p>
          <h2 data-rv>De donde estás a donde quieres llegar</h2>
          <div className="lp-pasos">
            {[
              { n: "01", icon: Sparkles, t: "Conecta tu información", d: "Sube tu CV, trae tu expediente de GS o conecta LinkedIn. Lo que no está capturado no cuenta." },
              { n: "02", icon: LineChart, t: "Mira tu brecha", d: "Comparamos tu perfil contra el descriptivo del puesto: capacidades, estudios, historial y escalafón." },
              { n: "03", icon: MapPinned, t: "Sigue tu camino", d: "Cada cosa que te falta es un paso del mapa. Se desbloquean en orden y ves el porcentaje avanzar." },
            ].map((p, i) => (
              <article key={p.n} className="lp-paso" data-rv style={{ "--i": i } as React.CSSProperties}>
                <span className="lp-num">{p.n}</span>
                <p.icon size={22} color="var(--brand)" />
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── El mapa ── */}
      <section className="lp-sec dark" id="mapa">
        <div className="lp-wrap lp-split">
          <div>
            <p className="kicker" data-rv>El mapa</p>
            <h2 data-rv>Un camino que se recorre, no una lista que se lee</h2>
            <p className="lp-sub" data-rv>
              Cada requisito que te falta es un nodo. Los que ya cumples llevan estrella, el
              siguiente late esperándote y los demás están con candado hasta que llegues. Arriba,
              el puesto al que aspiras.
            </p>
            <ul className="lp-lista" data-rv>
              <li>El porcentaje de avance, siempre a la vista</li>
              <li>Cada paso dice cómo conseguirlo, no solo qué falta</li>
              <li>La misma información en texto, para leerla con calma</li>
            </ul>
          </div>
          <div className="lp-mapa-demo" data-rv aria-hidden="true">
            <div className="lp-nodo done"><span>★</span></div>
            <div className="lp-via" />
            <div className="lp-nodo done"><span>★</span></div>
            <div className="lp-via" />
            <div className="lp-nodo now"><span>3</span></div>
            <div className="lp-via off" />
            <div className="lp-nodo lock"><Lock size={16} /></div>
            <div className="lp-via off" />
            <div className="lp-nodo meta">🏰</div>
          </div>
        </div>
      </section>

      {/* ── Bloqueo ── */}
      <section className="lp-sec" id="bloqueo">
        <div className="lp-wrap lp-centro">
          <p className="kicker" data-rv>Por qué bloqueamos</p>
          <h2 data-rv>Un “no” que enseña algo</h2>
          <p className="lp-sub lp-centrado" data-rv>
            Cuando una vacante no encaja, no se puede abrir. Pero en su lugar no aparece un rechazo:
            aparece tu camino hacia ella. El bloqueo deja de ser una puerta cerrada y se convierte
            en la entrada.
          </p>
        </div>
      </section>

      {/* ── Proyectos ── */}
      <section className="lp-sec bone" id="proyectos">
        <div className="lp-wrap lp-split">
          <div className="lp-proyectos-demo" data-rv aria-hidden="true">
            <Boxes size={54} color="var(--brand)" />
          </div>
          <div>
            <p className="kicker" data-rv>Proyectos</p>
            <h2 data-rv>No hace falta cambiar de puesto para empezar</h2>
            <p className="lp-sub" data-rv>
              Hay veinte proyectos abiertos en distintas unidades de negocio. No son un cambio de
              puesto: son trabajo real donde aprendes de otra área y construyes la evidencia que
              después te va a hacer falta.
            </p>
            <p className="lp-sub" data-rv>
              <b>Aquí la antigüedad no cuenta.</b> Puedes entrar desde tu primer día.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="lp-sec dark lp-final">
        <div className="lp-wrap lp-centro">
          <h2 data-rv>¿Sabes qué te falta para tu siguiente puesto?</h2>
          <p className="lp-sub lp-centrado" data-rv>Averígualo en un minuto.</p>
          <div className="lp-acciones lp-centrado" data-rv>
            <button className="lp-btn" onClick={() => setLogin(true)}>
              Ingresar <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <span>Mapa de Carrera · Movilidad interna</span>
          <span>Las postulaciones se realizan en Radar de Candidatos</span>
        </div>
      </footer>

      {login && <LoginModal onClose={() => setLogin(false)} onIngresar={onIngresar} />}
    </div>
  );
}
