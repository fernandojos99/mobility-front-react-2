/** El colaborador de la sesión actual. Atajo para no repetir el cruce en cada pantalla. */
import { useSesion } from "../contexts/SesionContext";
import { useData } from "../store/DataProvider";
import type { Colaborador } from "../types/domain";

export function useYo(): Colaborador | undefined {
  const { colaboradorId } = useSesion();
  const { colaboradores } = useData();
  return colaboradores.find((c) => c.id === colaboradorId);
}
