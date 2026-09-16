import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
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

// AC-0005-09: dos clientas "Nora" que solo se distinguen por DNI, y una sin DNI (dato viejo,
// anterior a la spec 0001) que no debe romper la búsqueda por nombre.
const CLIENT_NORA_RUIZ: Client = {
  id: 4,
  name: 'Nora',
  lastName: 'Ruiz',
  dni: '70999888',
  phone: '1177889901',
  active: true,
};

const CLIENT_SIN_DNI: Client = {
  id: 11,
  name: 'Walter',
  lastName: 'Soto',
  dni: null as unknown as string,
  phone: '1177889902',
  active: true,
};

const MONTHLY_TYPE: MonthlyType = { id: 4, type: 'Plan Full', price: 20000, durationDays: 30 };

// AC-0005-08..11: el modal de pago elige el cliente con el combobox "Cliente" en vez del <select>.
async function pickClient(dialog: HTMLElement, user: UserEvent, query: string, optionName: RegExp) {
  const clientCombobox = await within(dialog).findByRole('combobox', { name: 'Cliente' });
  await user.click(clientCombobox);
  await user.type(clientCombobox, query);
  await user.click(within(dialog).getByRole('option', { name: optionName }));
}

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
    await pickClient(dialog, user, 'Nora Vega', /Nora Vega/);

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

describe('PaymentsPage - selector de cliente con buscador (spec 0005)', () => {
  it('AC-0005-08: el modal muestra un combobox "Cliente" y ya no hay un <select> de clientes', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    const clientCombobox = await within(dialog).findByRole('combobox', { name: 'Cliente' });
    expect(clientCombobox.tagName).toBe('INPUT');
  });

  it('AC-0005-09: filtra por DNI sin puntos ni espacios, y por nombre sin romperse con un dni null', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    vi.mocked(getAllClientsList).mockResolvedValue([CLIENT, CLIENT_NORA_RUIZ, CLIENT_SIN_DNI]);
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    const clientCombobox = await within(dialog).findByRole('combobox', { name: 'Cliente' });

    await user.click(clientCombobox);
    await user.type(clientCombobox, '60.111');
    expect(within(dialog).getByRole('option', { name: /Nora Vega/ })).toBeInTheDocument();
    expect(within(dialog).queryByRole('option', { name: /Nora Ruiz/ })).not.toBeInTheDocument();

    await user.clear(clientCombobox);
    await user.type(clientCombobox, 'nora');
    expect(within(dialog).getByRole('option', { name: /Nora Vega/ })).toBeInTheDocument();
    expect(within(dialog).getByRole('option', { name: /Nora Ruiz/ })).toBeInTheDocument();
  });

  it('AC-0005-10: como PROFESSOR, elegir el cliente con el buscador y confirmar llama a createMonthlyPayment con su id', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    await pickClient(dialog, user, 'Nora Vega', /Nora Vega/);

    const monthlyLabel = within(dialog).getByText('Tipo de Cuota');
    const monthlySelect = monthlyLabel.parentElement!.querySelector('select')!;
    await user.selectOptions(monthlySelect, String(MONTHLY_TYPE.id));

    await user.click(within(dialog).getByRole('button', { name: /Confirmar Pago/i }));

    expect(createMonthlyPayment).toHaveBeenCalledWith(
      expect.objectContaining({ idClient: CLIENT.id }),
      expect.anything(),
    );
  });

  it('AC-0005-11: escribir un nombre sin elegir ninguna opción no envía el pago', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    const user = userEvent.setup();
    renderPaymentsPage();

    await user.click(screen.getByRole('button', { name: /Registrar Pago/i }));

    const dialog = screen.getByRole('dialog');
    const clientCombobox = await within(dialog).findByRole('combobox', { name: 'Cliente' });
    await user.click(clientCombobox);
    await user.type(clientCombobox, 'Nora');

    const monthlyLabel = within(dialog).getByText('Tipo de Cuota');
    const monthlySelect = monthlyLabel.parentElement!.querySelector('select')!;
    await user.selectOptions(monthlySelect, String(MONTHLY_TYPE.id));

    await user.click(within(dialog).getByRole('button', { name: /Confirmar Pago/i }));

    expect(createMonthlyPayment).not.toHaveBeenCalled();
  });
});
