/**
 * Cliente API reutilizable. ÚNICO lugar donde se hace `fetch`.
 * Los componentes nunca llaman fetch: usan los `services/*`, que usan este cliente.
 */
import { API_BASE_URL } from "../config/api";

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  /*
   * Si la respuesta no es JSON, no se sigue adelante.
   *
   * Antes esto devolvía `null` en silencio y el fallo estallaba mucho después, al hacer `.find()`
   * sobre lo que se creía un arreglo: pantalla en blanco y ni una pista. Pasa en cuanto
   * `VITE_API_URL` está mal y la petición acaba pegando contra el propio front, que —por el
   * rewrite del SPA— contesta 200 con el `index.html`.
   */
  const tipo = res.headers.get("content-type") ?? "";
  if (!tipo.includes("json")) {
    throw new ApiError(
      res.status,
      `La API respondió ${res.status} con «${tipo || "sin content-type"}» en vez de JSON. ` +
      `Comprueba VITE_API_URL: ahora mismo apunta a ${API_BASE_URL}`,
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data.message as string)) || `Error HTTP ${res.status}`;
    throw new ApiError(res.status, message, data?.details);
  }
  return data as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>("GET", path),
  post: <T>(path: string, body?: unknown): Promise<T> => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown): Promise<T> => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown): Promise<T> => request<T>("PUT", path, body),
  delete: <T>(path: string): Promise<T> => request<T>("DELETE", path),
};
