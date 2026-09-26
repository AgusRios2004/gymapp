/**
 * Montos en pesos argentinos: `$22.000`, `$1.234,50`. `toLocaleString()` sin locale usa el idioma
 * del navegador y en inglés muestra `$22,000` (spec 0009). El `$` va concatenado a mano:
 * `style: 'currency'` mete un espacio duro y fuerza `,00` en montos enteros.
 */

const integer = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const withCents = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Monto → `$22.000` (entero) o `$1.234,50` (con centavos); `-` si no hay monto. */
export function formatMoney(amount: number | null | undefined): string {
  if (amount == null) return '-';
  const rounded = Math.round(amount * 100) / 100;
  const formatter = Number.isInteger(rounded) ? integer : withCents;
  return `$${formatter.format(rounded)}`;
}
