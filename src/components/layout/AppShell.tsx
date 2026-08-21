/**
 * Marco de la aplicación: sidebar + topbar + contenido.
 * El toast global se pinta AQUÍ una sola vez; cualquier pantalla lo dispara con `useSesion().toast`.
 */
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSesion } from "../../contexts/SesionContext";
import { useData } from "../../store/DataProvider";

const TITULOS: Record<string, [string, string]> = {
  "/yo": ["Mi perfil", "Tu información profesional dentro y fuera del grupo"],
  "/yo/gap": ["Mi puesto", "Qué tan bien cubres el puesto que ocupas hoy"],
  "/yo/aspiracion": ["Mis aspiraciones", "A dónde quieres llegar y qué te separa de ahí"],
  "/oportunidades": ["Oportunidades", "Vacantes y proyectos que puedes tomar"],
  "/generalista": ["Reglas de movilidad", "Lo que decide quién se puede mover y cuándo"],
};

function tituloDe(pathname: string): [string, string] {
  if (pathname.startsWith("/yo/camino")) return ["Mi camino", "El recorrido hasta tu puesto objetivo"];
  return TITULOS[pathname] ?? ["Mapa de Carrera", "Movilidad interna"];
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { colaboradorId, rol, toastMsg } = useSesion();
  const { colaboradores, cargando, error } = useData();

  // Al navegar, el drawer se cierra solo: dejarlo abierto tapa la pantalla a la que acabas de ir.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const yo = colaboradores.find((c) => c.id === colaboradorId);
  const [titulo, subtitulo] = tituloDe(pathname);

  /*
   * `/yo` es la copia del componente de Grupo Salinas, y ese componente trae SU PROPIA barra
   * superior. Aquí se le quita la del shell —dos cabeceras seguidas no son el diseño de nadie— y se
   * le da el ancho completo: la hoja blanca de 1180 px la centra el propio componente. Su botón de
   * menú abre el sidebar de la aplicación, que se le pasa por el contexto del `Outlet`.
   *
   * `/yo/gap` y `/yo/aspiracion` usan la misma hoja pero SIN barra propia —se pidieron sin
   * navbar—, así que conservan el `Topbar` del shell y sólo heredan el ancho completo.
   */
  const esPerfil = pathname === "/yo";
  const aSangre = esPerfil
    || pathname === "/yo/gap"
    || pathname === "/yo/aspiracion"
    || pathname === "/oportunidades";

  return (
    <div className="mc">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        {!esPerfil && (
          <Topbar
            titulo={titulo}
            subtitulo={subtitulo}
            nombre={rol === "generalista" ? "Generalista" : yo?.nombre ?? "…"}
            foto={yo?.foto}
            onMenu={() => setMenuOpen(true)}
          />
        )}
        <div className={aSangre ? "content content-plano" : "content"}>
          {error && (
            <div className="card" style={{ borderColor: "#F0C4C1", background: "var(--bad-soft)" }}>
              <b style={{ color: "var(--bad)" }}>No se pudo conectar con el servidor</b>
              <p className="help">{error}. Comprueba que el backend esté corriendo en el puerto 4000.</p>
            </div>
          )}
          {cargando && !error
            ? <div className="spin" />
            : <Outlet context={{ abrirMenu: () => setMenuOpen(true) }} />}
        </div>
      </div>
      {toastMsg && (
        <div className="toast">
          <CheckCircle2 size={15} color="var(--gold)" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
