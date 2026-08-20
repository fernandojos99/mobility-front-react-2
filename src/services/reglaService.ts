/** Reglas del generalista, con su impacto en vivo. */
import { apiClient } from "../lib/apiClient";
import type { Impacto, ReglaMovilidad } from "../types/domain";

export interface RespuestaReglas { reglas: ReglaMovilidad; impacto: Impacto; }

export const reglaService = {
  obtener: (): Promise<RespuestaReglas> => apiClient.get("/reglas"),
  actualizar: (datos: Partial<ReglaMovilidad>): Promise<RespuestaReglas> =>
    apiClient.put("/reglas", datos),
};
