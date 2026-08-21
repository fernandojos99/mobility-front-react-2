/** Reglas del generalista, con su impacto en vivo. */
import { apiClient } from "../lib/apiClient";
import type { Impacto, ReglaMovilidad } from "../types/domain";

export interface RespuestaReglas { reglas: ReglaMovilidad; impacto: Impacto; }

export const reglaService = {
  obtener: (): Promise<RespuestaReglas> => apiClient.get("/reglas"),
  actualizar: (datos: Partial<ReglaMovilidad>): Promise<RespuestaReglas> =>
    apiClient.put("/reglas", datos),
};

/**
 * Controles de demo. No son parte del producto: existen para poder enseñar la aplicación desde
 * cero sin reiniciar el servidor a mano.
 */
export const demoService = {
  /** Devuelve TODO —colaboradores, reglas, proyectos— al estado de la semilla. */
  volverALaSemilla: (): Promise<{ ok: boolean; mensaje: string }> => apiClient.post("/reset"),
};
