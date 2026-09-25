import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, parseLocalDate, todayLocalISO } from './date';

// Solo se falsea Date: con los timers falsos completos, TanStack Query y waitFor se cuelgan.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('todayLocalISO', () => {
  it('AC-0008-01: a las 22:40 y el 31/12 a las 23:30 (hora argentina) devuelve el día local, no el UTC', () => {
    vi.setSystemTime(new Date('2026-09-24T22:40:00-03:00'));
    expect(todayLocalISO()).toBe('2026-09-24');

    vi.setSystemTime(new Date('2026-12-31T23:30:00-03:00'));
    expect(todayLocalISO()).toBe('2026-12-31');
  });

  it('AC-0008-02: pasada la medianoche devuelve el día nuevo, y rellena mes y día con cero', () => {
    vi.setSystemTime(new Date('2026-09-25T00:10:00-03:00'));
    expect(todayLocalISO()).toBe('2026-09-25');

    vi.setSystemTime(new Date('2026-09-05T10:00:00-03:00'));
    expect(todayLocalISO()).toBe('2026-09-05');
  });
});

describe('formatDate', () => {
  it('AC-0008-03: muestra DD/MM/AAAA del mismo día, y "-" si no hay fecha', () => {
    expect(formatDate('2026-09-24')).toBe('24/09/2026');
    expect(formatDate('')).toBe('-');
    expect(formatDate(null)).toBe('-');
  });
});

describe('parseLocalDate', () => {
  it('AC-0008-04: devuelve la medianoche local de ese día, no la UTC', () => {
    const date = parseLocalDate('2026-09-24');
    expect(date.getDate()).toBe(24);
    expect(date.getMonth()).toBe(8);
    expect(date.getDay()).toBe(4);
  });
});
