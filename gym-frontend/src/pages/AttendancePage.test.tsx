import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AttendancePage from './AttendancePage';
import { useAuth } from '../context/AuthContext';
import { getAllClientsList } from '../services/clientService';
import { getAssistanceByDate } from '../services/assistanceService';
import type { Client } from '../types';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../services/clientService');
vi.mock('../services/assistanceService');

// Cliente creado antes de la spec 0001, cuando el backend no validaba el DNI.
const CLIENT_WITHOUT_DNI = {
  id: 11,
  name: 'Lucia',
  lastName: 'Sosa',
  dni: null,
  phone: '1100000000',
  active: true,
} as unknown as Client;

const CLIENT_WITH_DNI: Client = {
  id: 12,
  name: 'Luciano',
  lastName: 'Paz',
  dni: '40111222',
  phone: '1100000001',
  active: true,
};

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 5, name: 'Test', lastName: 'User', email: 't@t.com', role: 'PROFESSOR', token: 'tok' },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  });
  vi.mocked(getAllClientsList).mockResolvedValue([CLIENT_WITHOUT_DNI, CLIENT_WITH_DNI]);
  vi.mocked(getAssistanceByDate).mockResolvedValue([]);
});

// AC-0002-11 (hallazgo del reviewer): el mismo caso de borde que en el punto de venta. Un cliente
// con dni null no puede romper la búsqueda de asistencias.
describe('AttendancePage - búsqueda con clientes sin DNI', () => {
  // Buscar por DNI es lo que rompe: con un nombre que no coincide, el filtro evalúa `c.dni` del
  // cliente sin DNI. Buscando por nombre el `||` corta antes y el bug no aparece.
  it('buscar por DNI no rompe la vista aunque haya un cliente con dni null', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AttendancePage />
      </QueryClientProvider>,
    );

    await vi.waitFor(() => expect(getAllClientsList).toHaveBeenCalled());
    await user.type(screen.getByPlaceholderText('DNI o Nombre del alumno...'), '40111');

    expect(await screen.findByText(/Luciano Paz/)).toBeInTheDocument();
    expect(screen.queryByText(/Lucia Sosa/)).not.toBeInTheDocument();
  });

  it('buscar por nombre muestra los clientes aunque uno tenga dni null', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AttendancePage />
      </QueryClientProvider>,
    );

    await vi.waitFor(() => expect(getAllClientsList).toHaveBeenCalled());
    await user.type(screen.getByPlaceholderText('DNI o Nombre del alumno...'), 'Luc');

    expect(await screen.findByText(/Lucia Sosa/)).toBeInTheDocument();
    expect(screen.getByText(/Luciano Paz/)).toBeInTheDocument();
  });
});
