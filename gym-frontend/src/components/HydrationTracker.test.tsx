import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import { HydrationTracker } from './HydrationTracker';
import { addWaterLog, getWaterLog } from '../services/waterLogService';
import type { WaterLog } from '../types/index';

vi.mock('../services/waterLogService');
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const LOG: WaterLog = { id: 1, clientId: 7, date: '2026-10-03', milliliters: 500, targetMilliliters: 3000 };

function backendError(message: string) {
  return Object.assign(new Error('Request failed'), { response: { status: 409, data: { message } } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('HydrationTracker - error de carga (AC-0014-07)', () => {
  it('AC-0014-07: si getWaterLog rechaza, muestra el error y no los botones', async () => {
    vi.mocked(getWaterLog).mockRejectedValue(new Error('Network Error'));

    render(<HydrationTracker clientId={7} />);

    expect(await screen.findByText('No pudimos cargar la hidratación')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /250 ml/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /500 ml/ })).not.toBeInTheDocument();
  });

  it('AC-0014-07: si getWaterLog resuelve algo que no es un objeto, muestra el mismo error', async () => {
    vi.mocked(getWaterLog).mockResolvedValue('{"id":1,"client":{"routineActive"' as unknown as WaterLog);

    render(<HydrationTracker clientId={7} />);

    expect(await screen.findByText('No pudimos cargar la hidratación')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /250 ml/ })).not.toBeInTheDocument();
  });
});

describe('HydrationTracker - error al sumar agua (AC-0014-08)', () => {
  it('AC-0014-08: si addWaterLog rechaza, muestra un toast con el message y mantiene el contador', async () => {
    vi.mocked(getWaterLog).mockResolvedValue(LOG);
    vi.mocked(addWaterLog).mockRejectedValue(backendError('El alumno no existe'));

    render(<HydrationTracker clientId={7} />);
    expect(await screen.findByText('500 ml')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /\+250 ml/ }));

    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(expect.stringContaining('El alumno no existe'));
    expect(screen.getByText('500 ml')).toBeInTheDocument();
  });
});
