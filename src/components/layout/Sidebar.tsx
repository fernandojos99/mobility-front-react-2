/**
 * Navegación y cambio de perfil.
 *
 * No hay autenticación: el `<select>` de colaborador ES la sesión. Cambiar de persona recarga la
 * página a propósito, para que ninguna pantalla se quede con datos derivados del anterior.
 */
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { NAV_COLABORADOR, NAV_GENERALISTA } from "./navegacion";
import { useSesion, type Rol } from "../../contexts/SesionContext";
import { useData } from "../../store/DataProvider";

interface Props { open: boolean; onClose: () => void; }

export function Sidebar({ open, onClose }: Props) {
  const { rol, setRol, colaboradorId, setColaboradorId } = useSesion();
  const { colaboradores } = useData();

  const nav = rol === "generalista" ? NAV_GENERALISTA : NAV_COLABORADOR;

  return (
    <>
      {open && <div className="side-backdrop" onClick={onClose} />}
      <nav className={"side" + (open ? " open" : "")}>
        <div className="logo">
          <div className="mark" aria-hidden="true">M</div>
          <div style={{ flex: 1 }}>
            <b>Mapa de Carrera</b>
            <span>Movilidad interna</span>
          </div>
          <button className="side-close" onClick={onClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === "/yo"}
            className={({ isActive }) => "nav-item" + (isActive ? " on" : "")}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <div className="rolebox">
          <p>Vista de demostración</p>
          <div className="field">
            <label htmlFor="sel-rol">Rol</label>
            <select id="sel-rol" value={rol}
              onChange={(e) => {
                setRol(e.target.value as Rol);
                window.location.assign(e.target.value === "generalista" ? "/generalista" : "/yo");
              }}>
              <option value="colaborador">Colaborador</option>
              <option value="generalista">Generalista</option>
            </select>
          </div>
          {rol === "colaborador" && (
            <div className="field">
              <label htmlFor="sel-colab">Colaborador</label>
              <select id="sel-colab" value={colaboradorId}
                onChange={(e) => {
                  setColaboradorId(Number(e.target.value));
                  window.location.reload();
                }}>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
