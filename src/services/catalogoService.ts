/** Catálogos y puestos. Vienen del backend para no duplicarlos a mano en los dos repos. */
import { apiClient } from "../lib/apiClient";
import type { Catalogos, Puesto } from "../types/domain";

export const catalogoService = {
  obtener: (): Promise<Catalogos> => apiClient.get("/catalogos"),
  puestos: (): Promise<Puesto[]> => apiClient.get("/puestos"),
  puesto: (id: string): Promise<Puesto> => apiClient.get(`/puestos/${id}`),
};
