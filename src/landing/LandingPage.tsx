/** Envoltorio tipado de la landing: resuelve a dónde entra cada rol tras el login. */
import { useNavigate } from "react-router-dom";
import { Landing } from "./Landing";
import { useSesion } from "../contexts/SesionContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { rol } = useSesion();
  return <Landing onIngresar={() => navigate(rol === "generalista" ? "/generalista" : "/yo")} />;
}
