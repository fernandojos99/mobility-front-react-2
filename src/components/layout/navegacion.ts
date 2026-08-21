/**
 * Las rutas de navegación, en UN solo sitio.
 *
 * Las consumen la barra lateral (`Sidebar.tsx`) y la fila de iconos del perfil (`HeroPerfilGS.tsx`).
 * Antes vivían sólo en el sidebar; al añadir la segunda navegación, duplicar el arreglo habría
 * garantizado que algún día una de las dos se quedara vieja.
 */
import { Briefcase, Flag, SlidersHorizontal, Target, UserRound } from "lucide-react";

export interface ItemNav {
  to: string;
  icon: typeof UserRound;
  label: string;
  /** Etiqueta corta para la fila de iconos, donde no cabe la larga. */
  corto: string;
}

export const NAV_COLABORADOR: ItemNav[] = [
  { to: "/yo", icon: UserRound, label: "Mi información", corto: "Mi perfil" },
  { to: "/yo/gap", icon: Target, label: "Mi desarrollo", corto: "Desarrollo" },
  { to: "/yo/aspiracion", icon: Flag, label: "Mis aspiraciones", corto: "Aspiraciones" },
  { to: "/oportunidades", icon: Briefcase, label: "Oportunidades", corto: "Oportunidades" },
];

export const NAV_GENERALISTA: ItemNav[] = [
  { to: "/generalista", icon: SlidersHorizontal, label: "Reglas de movilidad", corto: "Reglas" },
];
