/** Formato de presentación. Todo lo que sea CÁLCULO de negocio vive en el backend. */

export const money = (n: number): string => "$" + Number(n).toLocaleString("es-MX");

/**
 * Color de una banda de compatibilidad. Los cortes son los umbrales heredados de Radar:
 * 90 = ideal, 70 = afín. Debajo de 70 se pinta en rojo de nodo.
 */
export const bandCol = (v: number): string =>
  v >= 90 ? "var(--ok)" : v >= 70 ? "var(--gold)" : "var(--bad)";

/** Tono de chip para un porcentaje, con la misma escala. */
export const bandTone = (v: number): string => (v >= 90 ? "ok" : v >= 70 ? "gold" : "bad");

export const iniciales = (nombre: string): string =>
  nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

/** "3 capacidades" / "1 capacidad": el plural que hay que escribir a mano en español. */
export const plural = (n: number, singular: string, plural_: string): string =>
  `${n} ${n === 1 ? singular : plural_}`;

/**
 * Puente entre el dominio y el `<input type="date">`.
 *
 * El dominio guarda es-MX ("01 jul 2026") y nunca ISO — regla heredada de Radar. El input nativo
 * sólo habla ISO ("2026-07-01"). Estas dos funciones son la frontera: fuera del formulario, no
 * debería existir una fecha en ISO.
 *
 * Se usa el input nativo a propósito: en móvil abre el selector de fecha del sistema, que es el
 * calendario que la gente ya sabe usar.
 */
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "01 jul 2026" → "2026-07-01". Cadena vacía si no cuadra (el input se queda en blanco). */
export function esMxAIso(esMx?: string): string {
  const m = /(\d{1,2})\s+([a-záéíóúñ]{3,})\.?\s+(\d{4})/i.exec(String(esMx ?? ""));
  if (!m) return "";
  const mes = MESES.indexOf(m[2].slice(0, 3).toLowerCase());
  if (mes < 0) return "";
  return `${m[3]}-${String(mes + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** "2026-07-01" → "01 jul 2026". Devuelve la entrada tal cual si no es ISO. */
export function isoAEsMx(iso?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ""));
  if (!m) return String(iso ?? "");
  return `${m[3]} ${MESES[Number(m[2]) - 1]} ${m[1]}`;
}
