/** Proyectos laterales. */
import { apiClient } from "../lib/apiClient";
import type { Proyecto, ProyectoOportunidad } from "../types/domain";

export const proyectoService = {
  listar: (): Promise<Proyecto[]> => apiClient.get("/proyectos"),
  postular: (proyectoId: string, colaboradorId: number): Promise<ProyectoOportunidad> =>
    apiClient.post(`/proyectos/${proyectoId}/postular`, { colaboradorId }),
};
