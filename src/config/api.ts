/**
 * Apuntador al backend con fallback.
 *
 * Si existe `VITE_API_URL` (archivo `.env` local, o variable de entorno en Vercel) se usa esa.
 * Si no, se cae a producción. Por eso el `.env` está en el `.gitignore`: subirlo a Vercel dejaría
 * la aplicación desplegada apuntando a localhost.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "https://mapa-de-carrera-back.vercel.app/api";
