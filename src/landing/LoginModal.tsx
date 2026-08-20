/**
 * Modal de acceso. Portado del login de Radar de Candidatos, que es lo que pidió el brief
 * ("toma el login de radar de candidatos, solo la parte del login").
 *
 * Es una demo y se dice en pantalla: cualquier valor entra. Lo que sí se conserva del original
 * son los detalles que hacen que un modal se sienta bien hecho — foco automático en el primer
 * campo, Escape para cerrar, el body bloqueado mientras está abierto y `aria-modal`.
 */
import { useEffect, useRef } from "react";
import { X, ArrowRight } from "lucide-react";

interface Props {
  onClose: () => void;
  onIngresar: () => void;
}

/** Logo de Microsoft, SVG en línea: sin peticiones externas. */
const LogoMS = () => (
  <svg width="17" height="17" viewBox="0 0 21 21" aria-hidden="true">
    <rect x="0" y="0" width="10" height="10" fill="#F25022" />
    <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
    <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
    <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
  </svg>
);

export function LoginModal({ onClose, onIngresar }: Props) {
  const primero = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primero.current?.focus();
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lg-bg" onClick={onClose}>
      <div className="lg" role="dialog" aria-modal="true" aria-labelledby="lg-title"
        onClick={(e) => e.stopPropagation()}>
        <button className="lg-x" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        <div className="mk" aria-hidden="true">M</div>
        <h3 id="lg-title">Ingresar a Mapa de Carrera</h3>
        <p>Accede con tus credenciales corporativas para ver tu camino.</p>

        <form onSubmit={(e) => { e.preventDefault(); onIngresar(); }}>
          <label htmlFor="lg-emp">Número de empleado</label>
          <input id="lg-emp" ref={primero} inputMode="numeric" autoComplete="username" placeholder="Ej. 1149816" />
          <label htmlFor="lg-pass">Contraseña</label>
          <input id="lg-pass" type="password" autoComplete="current-password" placeholder="Tu contraseña" />
          <button type="submit" className="b">Ingresar <ArrowRight size={17} /></button>
        </form>

        <div className="lg-sep">O BIEN</div>
        <button className="lg-ms" onClick={onIngresar}><LogoMS /> Ingresar con cuenta Microsoft</button>
        <p className="lg-note">Demo de validación: cualquier valor te llevará a la plataforma.</p>
      </div>
    </div>
  );
}
