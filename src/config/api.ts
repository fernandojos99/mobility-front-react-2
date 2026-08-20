/**
 * Apuntador al backend con fallback.
 *
 * Si existe `VITE_API_URL` (archivo `.env` local, o variable de entorno en Vercel) se usa esa.
 * Si no, se cae a producción. Por eso el `.env` está en el `.gitignore`: subirlo a Vercel dejaría
 * la aplicación desplegada apuntando a localhost.
 */

const CRUDA = import.meta.env.VITE_API_URL ?? "https://mobility-backend-express-2.vercel.app/api";

/**
 * Normaliza lo que venga de la variable de entorno.
 *
 * TRAMPA que ya se cobró un despliegue: si `VITE_API_URL` viene SIN esquema
 * (`mobility-backend-express-2.vercel.app/api`), `fetch` la interpreta como ruta RELATIVA y la
 * resuelve contra el dominio del front. La petición acaba en
 * `https://el-front.vercel.app/mobility-backend-.../catalogos` y —como `vercel.json` reescribe todo
 * a `index.html`— devuelve 200 con HTML en vez de 404. El síntoma aparece lejísimos de la causa:
 * pantalla en blanco. Por eso aquí se completa el esquema y se avisa.
 */
function normalizar(url: string): string {
  const limpia = url.trim().replace(/\/+$/, "");

  if (!limpia) {
    console.error("[api] VITE_API_URL está vacía. Se usará el backend de producción por defecto.");
    return "https://mobility-backend-express-2.vercel.app/api";
  }

  const absoluta = /^https?:\/\//i.test(limpia) ? limpia : `https://${limpia}`;
  if (absoluta !== limpia) {
    console.warn(
      `[api] VITE_API_URL no traía esquema ("${limpia}"). Sin él, fetch la trataría como ruta ` +
      `relativa al dominio del front. Se asume https:// → "${absoluta}". Corrígela en Vercel.`,
    );
  }

  // Todas las rutas del backend cuelgan de `/api` (ver `API_PREFIX`). Sin ese sufijo, cada
  // llamada responde 404 y no hay forma de adivinar por qué desde la pantalla.
  if (!/\/api$/i.test(absoluta)) {
    console.warn(
      `[api] VITE_API_URL no termina en "/api" ("${absoluta}"). El backend sirve todo bajo /api, ` +
      "así que las llamadas van a devolver 404.",
    );
  }

  return absoluta;
}

export const API_BASE_URL: string = normalizar(CRUDA);
