import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import { ClientNutritionTab } from './ClientNutritionTab';
import { deleteMealLog, getActiveNutritionPlan, getMealLogs, logMeal } from '../services/nutritionService';
import type { MealLog } from '../types/index';

vi.mock('../services/nutritionService');
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const MEAL: MealLog = { id: 3, clientId: 7, date: '2026-10-03', mealType: 'ALMUERZO', description: 'Pollo con arroz', calories: 650, proteinGrams: 45 };

function backendError(status: number, message?: string) {
  return Object.assign(new Error('Request failed'), { response: { status, data: message ? { message } : {} } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ClientNutritionTab - error de carga (AC-0014-10)', () => {
  it('AC-0014-10: si getMealLogs rechaza, muestra el error de carga', async () => {
    vi.mocked(getActiveNutritionPlan).mockResolvedValue(null);
    vi.mocked(getMealLogs).mockRejectedValue(new Error('Network Error'));

    render(<ClientNutritionTab clientId={7} />);

    expect(await screen.findByText('No pudimos cargar la nutrición')).toBeInTheDocument();
    expect(screen.queryByText('No hay comidas registradas para hoy.')).not.toBeInTheDocument();
  });

  it('AC-0014-10: si getActiveNutritionPlan rechaza con un status distinto de 404, muestra el error de carga', async () => {
    vi.mocked(getActiveNutritionPlan).mockRejectedValue(backendError(500));
    vi.mocked(getMealLogs).mockResolvedValue([]);

    render(<ClientNutritionTab clientId={7} />);

    expect(await screen.findByText('No pudimos cargar la nutrición')).toBeInTheDocument();
  });

  it('AC-0014-10: sin plan (null) y sin comidas ([]) no muestra el error de carga', async () => {
    vi.mocked(getActiveNutritionPlan).mockResolvedValue(null);
    vi.mocked(getMealLogs).mockResolvedValue([]);

    render(<ClientNutritionTab clientId={7} />);

    expect(await screen.findByText('No hay comidas registradas para hoy.')).toBeInTheDocument();
    expect(screen.queryByText('No pudimos cargar la nutrición')).not.toBeInTheDocument();
  });
});

describe('ClientNutritionTab - error al registrar o borrar (AC-0014-11)', () => {
  beforeEach(() => {
    vi.mocked(getActiveNutritionPlan).mockResolvedValue(null);
    vi.mocked(getMealLogs).mockResolvedValue([MEAL]);
  });

  it('AC-0014-11: si logMeal rechaza, muestra un toast con el message', async () => {
    vi.mocked(logMeal).mockRejectedValue(backendError(404, 'El alumno no existe'));

    render(<ClientNutritionTab clientId={7} />);
    await userEvent.type(screen.getByPlaceholderText(/3 huevos/), 'Yogur con granola');
    await userEvent.click(screen.getByRole('button', { name: /Guardar Registro de Comida/ }));

    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(expect.stringContaining('El alumno no existe'));
  });

  it('AC-0014-11: si deleteMealLog rechaza, muestra un toast con el message', async () => {
    vi.mocked(deleteMealLog).mockRejectedValue(backendError(404, 'La comida no existe'));

    render(<ClientNutritionTab clientId={7} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));

    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(expect.stringContaining('La comida no existe'));
  });
});
