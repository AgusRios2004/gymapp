import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ProductsPage from './ProductsPage';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import { createProductPayment, getAllPayments } from '../services/paymentService';
import { getAllClientsList } from '../services/clientService';
import { getProfessors } from '../services/professorService';
import type { Client, Product, Professor, User } from '../types';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../services/productService');
vi.mock('../services/paymentService');
vi.mock('../services/clientService');
vi.mock('../services/professorService');

const PRODUCT: Product = { id: 1, productName: 'Proteina', price: 15000, stock: 10 };

const CLIENT_MARINA: Client = {
  id: 1,
  name: 'Marina',
  lastName: 'Suarez',
  dni: '20111222',
  phone: '1122334455',
  active: true,
};

// AC-0002-11: clientes cargados antes de la spec 0001 pueden tener dni null.
const CLIENT_BRUNO_WITHOUT_DNI: Client = {
  id: 2,
  name: 'Bruno',
  lastName: 'Diaz',
  dni: null as unknown as string,
  phone: '1133445566',
  active: true,
};

const ACTIVE_PROFESSOR: Professor = {
  id: 9,
  name: 'Hugo',
  lastName: 'Ibarra',
  dni: '91111222',
  phone: '1188990011',
  active: true,
};

function mockUser(overrides: Partial<User>) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 5, name: 'Test', lastName: 'User', email: 't@t.com', role: 'PROFESSOR', token: 'tok', ...overrides },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  });
}

function renderProductsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductsPage />
    </QueryClientProvider>,
  );
}

async function goToPosTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Punto de Venta/i }));
}

beforeEach(() => {
  vi.mocked(getProducts).mockResolvedValue([PRODUCT]);
  vi.mocked(getAllPayments).mockResolvedValue([]);
  vi.mocked(createProductPayment).mockResolvedValue({
    id: 1,
    amount: 15000,
    date: '2026-09-14',
    paymentType: 'PRODUCTS',
  });
  vi.mocked(getAllClientsList).mockResolvedValue([CLIENT_MARINA]);
  vi.mocked(getProfessors).mockResolvedValue([ACTIVE_PROFESSOR]);
});

// AC-0002-09: como PROFESSOR, el POS no muestra selector de profesor y la venta se confirma sin
// mandar idProfessor en el body.
describe('ProductsPage - POS como PROFESSOR (AC-0002-09)', () => {
  it('no muestra selector de profesor y confirma la venta sin idProfessor', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    const user = userEvent.setup();
    renderProductsPage();

    await goToPosTab(user);

    expect(screen.queryAllByRole('combobox')).toHaveLength(0);

    await user.click(await screen.findByRole('button', { name: /Proteina/i }));

    await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'Marina');
    await user.click(await screen.findByText(/Marina Suarez/i));

    await user.click(screen.getByRole('button', { name: /Confirmar Venta/i }));

    expect(createProductPayment).toHaveBeenCalledTimes(1);
    const call = vi.mocked(createProductPayment).mock.calls[0][0] as unknown as Record<string, unknown>;
    expect(call.idProfessor).toBeUndefined();
  });
});

// AC-0002-10: como ADMIN, el POS muestra selector de profesor obligatorio; "Confirmar venta" queda
// deshabilitado hasta elegir cliente, profesor y al menos un producto.
describe('ProductsPage - POS como ADMIN (AC-0002-10)', () => {
  it('muestra el selector de profesor, deshabilita la venta sin profesor elegido y manda el idProfessor elegido', async () => {
    mockUser({ id: 99, role: 'ADMIN' });
    const user = userEvent.setup();
    renderProductsPage();

    await goToPosTab(user);

    const professorCombobox = await screen.findByRole('combobox', { name: 'Profesor' });

    await user.click(await screen.findByRole('button', { name: /Proteina/i }));
    await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'Marina');
    await user.click(await screen.findByText(/Marina Suarez/i));

    expect(screen.getByRole('button', { name: /Confirmar Venta/i })).toBeDisabled();

    await user.click(professorCombobox);
    await user.click(screen.getByRole('option', { name: `${ACTIVE_PROFESSOR.name} ${ACTIVE_PROFESSOR.lastName}` }));

    expect(screen.getByRole('button', { name: /Confirmar Venta/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /Confirmar Venta/i }));

    expect(createProductPayment).toHaveBeenCalledTimes(1);
    const call = vi.mocked(createProductPayment).mock.calls[0][0] as unknown as Record<string, unknown>;
    expect(call.idProfessor).toBe(ACTIVE_PROFESSOR.id);
  });
});

// AC-0002-11: con un cliente sin dni (dato previo a la spec 0001), buscar por nombre no rompe la
// búsqueda y el click deja el nombre en el campo.
describe('ProductsPage - búsqueda de cliente con dni null (AC-0002-11)', () => {
  it('busca por nombre sin romper y deja el cliente elegido en el campo', async () => {
    mockUser({ id: 5, role: 'PROFESSOR' });
    vi.mocked(getAllClientsList).mockResolvedValue([CLIENT_MARINA, CLIENT_BRUNO_WITHOUT_DNI]);
    const user = userEvent.setup();
    renderProductsPage();

    await goToPosTab(user);
    await screen.findByPlaceholderText('Buscar cliente...');

    await user.type(screen.getByPlaceholderText('Buscar cliente...'), 'Marina');
    await user.click(await screen.findByText(/Marina Suarez/i));

    expect(screen.getByPlaceholderText('Buscar cliente...')).toHaveValue('Marina Suarez');
  });
});
