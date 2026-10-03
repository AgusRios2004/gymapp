import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import { SupplementTracker } from './SupplementTracker';
import { getSupplementLog, saveSupplementLog } from '../services/supplementService';
import type { SupplementLog } from '../types/index';

vi.mock('../services/supplementService');
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const LOG: SupplementLog = { id: 1, clientId: 7, date: '2026-10-03', creatineTaken: false, proteinTaken: true };

function backendError(message: string) {
  return Object.assign(new Error('Request failed'), { response: { status: 409, data: { message } } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SupplementTracker - errores visibles (AC-0014-09)', () => {
  it('AC-0014-09: si getSupplementLog rechaza, muestra el error y no las opciones', async () => {
    vi.mocked(getSupplementLog).mockRejectedValue(new Error('Network Error'));

    render(<SupplementTracker clientId={7} />);

    expect(await screen.findByText('No pudimos cargar los suplementos')).toBeInTheDocument();
    expect(screen.queryByText(/Creatina/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Proteína en Polvo/)).not.toBeInTheDocument();
  });

  it('AC-0014-09: si getSupplementLog resuelve algo que no es un objeto, muestra el mismo error', async () => {
    vi.mocked(getSupplementLog).mockResolvedValue(undefined as unknown as SupplementLog);

    render(<SupplementTracker clientId={7} />);

    expect(await screen.findByText('No pudimos cargar los suplementos')).toBeInTheDocument();
    expect(screen.queryByText(/Creatina/)).not.toBeInTheDocument();
  });

  it('AC-0014-09: si saveSupplementLog rechaza, muestra un toast con el message y no cambia el estado', async () => {
    vi.mocked(getSupplementLog).mockResolvedValue(LOG);
    vi.mocked(saveSupplementLog).mockRejectedValue(backendError('No se pudo guardar'));

    render(<SupplementTracker clientId={7} />);
    await userEvent.click(await screen.findByText(/Creatina/));

    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(expect.stringContaining('No se pudo guardar'));
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Tomado')).toBeInTheDocument();
  });
});
