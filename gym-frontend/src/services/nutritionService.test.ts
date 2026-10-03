import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../lib/axios';
import { getActiveNutritionPlan } from './nutritionService';

vi.mock('../lib/axios', () => ({ default: { get: vi.fn() } }));

function httpError(status: number) {
  return Object.assign(new Error('Request failed'), { response: { status, data: {} } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// AC-0014-10: "sin plan" (404) no se confunde con una falla de carga.
describe('getActiveNutritionPlan (AC-0014-10)', () => {
  it('AC-0014-10: con 404 resuelve null', async () => {
    vi.mocked(api.get).mockRejectedValue(httpError(404));

    await expect(getActiveNutritionPlan(7)).resolves.toBeNull();
  });

  it('AC-0014-10: con un status distinto de 404 rechaza', async () => {
    vi.mocked(api.get).mockRejectedValue(httpError(500));

    await expect(getActiveNutritionPlan(7)).rejects.toThrow();
  });

  it('AC-0014-10: sin respuesta (red caída) rechaza', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network Error'));

    await expect(getActiveNutritionPlan(7)).rejects.toThrow();
  });
});
