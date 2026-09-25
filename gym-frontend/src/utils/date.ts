/**
 * Fechas sin hora (`LocalDate` del backend, `AAAA-MM-DD`) en la zona local del navegador.
 * `toISOString()` y `new Date('AAAA-MM-DD')` trabajan en UTC y corren la fecha un día en
 * Argentina (spec 0008): no usarlos para fechas de negocio.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha de hoy según el calendario local, como `AAAA-MM-DD`. */
export function todayLocalISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** `AAAA-MM-DD` → `Date` a la medianoche local de ese día. */
export function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** `AAAA-MM-DD` → `DD/MM/AAAA`; `-` si no hay fecha. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
