/** Llamadas al backend relacionadas con el colaborador. Nunca usan `fetch`: pasan por apiClient. */
import { apiClient } from "../lib/apiClient";
import type {
  Camino, Colaborador, Completitud, GapActual, ProyectoOportunidad,
  PuestoCompatible, FuenteIntegracion,
  ResultadoIntegracion, VacanteOportunidad,
} from "../types/domain";

export const colaboradorService = {
  listar: (): Promise<Colaborador[]> => apiClient.get("/colaboradores"),

  obtener: (id: number): Promise<Colaborador> => apiClient.get(`/colaboradores/${id}`),

  actualizar: (id: number, colaborador: Partial<Colaborador>): Promise<Colaborador> =>
    apiClient.put(`/colaboradores/${id}`, { colaborador }),

  definirAspiracion: (id: number, puestoObjetivoId: string, motivo?: string): Promise<Colaborador> =>
    apiClient.put(`/colaboradores/${id}/aspiracion`, { puestoObjetivoId, motivo }),

  completitud: (id: number): Promise<Completitud> => apiClient.get(`/colaboradores/${id}/completitud`),

  integrar: (id: number, fuente: FuenteIntegracion): Promise<ResultadoIntegracion> =>
    apiClient.post(`/colaboradores/${id}/integraciones/${fuente}`),

  gap: (id: number): Promise<GapActual> => apiClient.get(`/colaboradores/${id}/gap`),

  camino: (id: number, puestoId: string): Promise<Camino> =>
    apiClient.get(`/colaboradores/${id}/camino/${puestoId}`),

  puestos: (id: number): Promise<PuestoCompatible[]> => apiClient.get(`/colaboradores/${id}/puestos`),

  vacantes: (id: number): Promise<VacanteOportunidad[]> =>
    apiClient.get(`/colaboradores/${id}/oportunidades/vacantes`),

  proyectos: (id: number): Promise<ProyectoOportunidad[]> =>
    apiClient.get(`/colaboradores/${id}/oportunidades/proyectos`),
};
