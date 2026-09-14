import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PaymentsPage from './PaymentsPage';
import { useAuth } from '../context/AuthContext';
import { getAllPayments, getMonthlyTypes, createMonthlyPayment } from '../services/paymentService';
import { getAllClientsList } from '../services/clientService';
import { getProfessors } from '../services/professorService';
import type { Client, MonthlyType, Professor, User } from '../types';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../services/paymentService');
vi.mock('../services/clientService');
vi.mock('../services/professorService');

const ACTIVE_PROFESSOR: Professor = {
  id: 9,
  name: 'Hugo',
  lastName: 'Ibarra',
  dni: '91111222',
  phone: '1188990011',
  active: true,
};

const CLIENT: Client = {
  id: 3,
  name: 'Nora',
  lastName: 'Vega',
  dni: '60111222',
  phone: '1177889900',
  active: true,
};

const MONTHLY_TYPE: MonthlyType = { id: 4, type: 'Plan Full', price: 20000, durationDays: 30 };

function mockUser(overrides: Partial<User>) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 5, name: 'Test', lastName: 'User', email: 't@t.com', role: 'PROFESSOR', token: 'tok', ...overrides },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  });
}

function renderPaymentsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentsPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(getAllPayments).mockResolvedValue([]);
  vi.mocked(getMonthlyTypes).mockResolvedValue([MONTHLY_TYPE]);
  vi.mocked(getAllClientsList).mockResolvedValue([CLIENT]);
  vi.mocked(getProfessors).mockResolvedValue([ACTIVE_PROFESSOR]);
  vi.mocked(createMonthlyPayment).mockResolvedValue({
    id: 1,
    amount: MONTHLY_TYPE.price,
    date: '2026-09-14',
    paymentType: 'MONTHLY',
  });
});

// AC-0002-12: PaymentsPage con ADMIN muestra el selector de profesor sin valor elegido; con
// PROFESSOR no lo muestra.
describe('PaymentsPage - selector de profesor por rol (AC-0002-12)', () => {
  it('con ADMIN no envía el pago si no elige un profesor explícitamente', async () => {
    // Hoy el selector arranca con el id del propio admin (BUG-05): no es un valor "vacío", así
    // que la validación de "completá todos los campos" lo deja pasar sin haber elegido profesor.
    mockUser({ id: 777, role: 'ADMIN' });
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    const clientLabel = await within(dialog).findByText('Cliente');
    const clientSelect = clientLabel.parentElement!.querySelector('select')!;
    await user.selectOptions(clientSelect, String(CLIENT.id));

    const monthlyLabel = within(dialog).getByText('Tipo de Cuota');
    const monthlySelect = monthlyLabel.parentElement!.querySelector('select')!;
    await user.selectOptions(monthlySelect, String(MONTHLY_TYPE.id));

    await user.click(within(dialog).getByRole('button', { name: /Confirmar Pago/i }));

    expect(createMonthlyPayment).not.toHaveBeenCalled();
  });

  // Hallazgo del reviewer: el test de arriba solo verifica que no se envíe el pago. Si el bloque
  // del selector desapareciera, seguiría verde y el ADMIN no podría cobrar ninguna cuota.
  it('con ADMIN muestra el selector de profesor, sin valor elegido y con los profesores activos', async () => {
    mockUser({ id: 777, role: 'ADMIN' });
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    const professorLabel = await within(dialog).findByText('Profesor que cobra');
    const professorSelect = professorLabel.parentElement!.querySelector('select');
    expect(professorSelect).not.toBeNull();
    expect(professorSelect!.value).toBe('');
    expect(
      await within(professorSelect!).findByRole('option', { name: `${ACTIVE_PROFESSOR.name} ${ACTIVE_PROFESSOR.lastName}` }),
    ).toBeInTheDocument();
  });

  it('con PROFESSOR no muestra selector de profesor', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    await within(dialog).findByText('Tipo de Cuota');
    expect(within(dialog).queryByText('Profesor que cobra')).not.toBeInTheDocument();
  });
});
