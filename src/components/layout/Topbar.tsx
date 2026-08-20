import { Menu } from "lucide-react";
import { Avatar } from "../common/Avatar";

interface Props {
  titulo: string;
  subtitulo: string;
  nombre: string;
  foto?: string | null;
  onMenu: () => void;
}

export function Topbar({ titulo, subtitulo, nombre, foto, onMenu }: Props) {
  return (
    <div className="topbar">
      <button className="iconbtn menu-btn" onClick={onMenu} aria-label="Abrir menú">
        <Menu size={18} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2>{titulo}</h2>
        <div className="crumb">{subtitulo}</div>
      </div>
      <Avatar nombre={nombre} foto={foto} />
    </div>
  );
}
