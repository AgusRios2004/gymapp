import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ClientsPage from './ClientsPage';
import { getClients, setClientStatus } from '../services/clientService';
import type { Client, PageResponse } from '../types';

vi.mock('../services/clientService');

const CLIENT_ACTIVE: Client = {
  id: 1,
  name: 'Marina',
  lastName: 'Suarez',
  dni: '20111222',
  phone: '1122334455',
  active: true,
};

const CLIENT_INACTIVE: Client = {
  id: 2,
  name: 'Bruno',
  lastName: 'Diaz',
  dni: '30111222',
  phone: '1133445566',
  active: false,
};

function pageOf(clients: Client[]): PageResponse<Client> {
  return {
    content: clients,
    totalPages: 1,
    totalElements: clients.length,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };
}

function renderClientsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ClientsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function switchFor() {
  return screen.findByRole('button', { name: /Cambiar estado/i });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// AC-0004-08: tocar el interruptor de un cliente activo y aceptar la confirmación llama al
// servicio con active:false para ese id, y la fila muestra "Inactivo" después de que el servicio
// responde.
describe('ClientsPage - desactivar con confirmación aceptada (AC-0004-08)', () => {
  it('llama a setClientStatus con active:false y la fila pasa a Inactivo', async () => {
    vi.mocked(getClients)
      .mockResolvedValueOnce(pageOf([CLIENT_ACTIVE]))
      .mockResolvedValue(pageOf([{ ...CLIENT_ACTIVE, active: false }]));
    vi.mocked(setClientStatus).mockResolvedValue({ ...CLIENT_ACTIVE, active: false });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderClientsPage();

    await screen.findByText(/Marina Suarez/i);
    expect(screen.getByText('Activo')).toBeInTheDocument();

    await user.click(await switchFor());

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    const confirmMessage = confirmSpy.mock.calls[0][0] as string;
    expect(confirmMessage).toContain('Marina');
    expect(confirmMessage.toLowerCase()).toContain('clase');

    expect(setClientStatus).toHaveBeenCalledWith(CLIENT_ACTIVE.id, false);

    await waitFor(() => expect(screen.getByText('Inactivo')).toBeInTheDocument());
  });
});

// AC-0004-09: si el servicio de cambio de estado falla, el interruptor vuelve a mostrar el estado
// anterior y la fila no cambia a "Inactivo".
describe('ClientsPage - falla el cambio de estado (AC-0004-09)', () => {
  it('mantiene la fila en Activo cuando el servicio responde con error', async () => {
    vi.mocked(getClients).mockResolvedValue(pageOf([CLIENT_ACTIVE]));
    vi.mocked(setClientStatus).mockRejectedValue(new Error('No se pudo actualizar el estado'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderClientsPage();

    await screen.findByText(/Marina Suarez/i);
    await user.click(await switchFor());

    await waitFor(() => expect(setClientStatus).toHaveBeenCalledTimes(1));

    await waitFor(async () => expect(await switchFor()).not.toBeDisabled());
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.queryByText('Inactivo')).not.toBeInTheDocument();
  });
});

// AC-0004-10: mientras el pedido de cambio de estado está en curso, el interruptor de esa fila
// está deshabilitado.
describe('ClientsPage - pedido en curso (AC-0004-10)', () => {
  it('deshabilita el interruptor mientras la mutación está pendiente', async () => {
    vi.mocked(getClients).mockResolvedValue(pageOf([CLIENT_ACTIVE]));
    let resolveStatus: (client: Client) => void = () => {};
    vi.mocked(setClientStatus).mockImplementation(
      () => new Promise<Client>((resolve) => { resolveStatus = resolve; }),
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderClientsPage();

    await screen.findByText(/Marina Suarez/i);
    await user.click(await switchFor());

    await waitFor(async () => expect(await switchFor()).toBeDisabled());

    resolveStatus({ ...CLIENT_ACTIVE, active: false });

    await waitFor(async () => expect(await switchFor()).not.toBeDisabled());
  });
});

// AC-0004-13: cancelar la confirmación no llama al servicio y la fila sigue "Activo"; reactivar un
// cliente inactivo llama directo, sin pedir confirmación.
describe('ClientsPage - confirmación cancelada y reactivación directa (AC-0004-13)', () => {
  it('cancelar la confirmación no dispara el servicio', async () => {
    vi.mocked(getClients).mockResolvedValue(pageOf([CLIENT_ACTIVE]));
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const user = userEvent.setup();
    renderClientsPage();

    await screen.findByText(/Marina Suarez/i);
    await user.click(await switchFor());

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(setClientStatus).not.toHaveBeenCalled();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('reactivar un cliente inactivo llama al servicio con active:true sin pedir confirmación', async () => {
    vi.mocked(getClients)
      .mockResolvedValueOnce(pageOf([CLIENT_INACTIVE]))
      .mockResolvedValue(pageOf([{ ...CLIENT_INACTIVE, active: true }]));
    vi.mocked(setClientStatus).mockResolvedValue({ ...CLIENT_INACTIVE, active: true });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const user = userEvent.setup();
    renderClientsPage();

    await screen.findByText(/Bruno Diaz/i);
    await user.click(await switchFor());

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(setClientStatus).toHaveBeenCalledWith(CLIENT_INACTIVE.id, true);

    await waitFor(() => expect(screen.getByText('Activo')).toBeInTheDocument());
  });
});
