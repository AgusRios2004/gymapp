import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('AC-0009-01: separa los miles con punto, también en números de 4 cifras', () => {
    expect(formatMoney(22000)).toBe('$22.000');
    expect(formatMoney(1500)).toBe('$1.500');
  });

  it('AC-0009-02: millones con dos puntos, y el cero se muestra como $0', () => {
    expect(formatMoney(1234567)).toBe('$1.234.567');
    expect(formatMoney(0)).toBe('$0');
  });

  it('AC-0009-03: dos decimales con coma si no es entero, ninguno si redondea a entero', () => {
    expect(formatMoney(1234.5)).toBe('$1.234,50');
    expect(formatMoney(99.999)).toBe('$100');
  });

  it('AC-0009-04: sin monto devuelve "-"', () => {
    expect(formatMoney(null)).toBe('-');
    expect(formatMoney(undefined)).toBe('-');
  });
});
