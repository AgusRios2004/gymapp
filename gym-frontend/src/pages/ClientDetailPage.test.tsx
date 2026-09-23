import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ClientDetailPage from './ClientDetailPage';
import { getClientById } from '../services/clientService';
import {
  getClientAssistance,
  getClientPayments,
  getClientRoutines,
  getClientProductsPurchased,
} from '../services/clientInfoService';
import { getPhysicalRecords } from '../services/physicalRecordService';
import type { Client, Routine, Payment } from '../types';

vi.mock('../services/clientService');
vi.mock('../services/clientInfoService');
vi.mock('../services/physicalRecordService');

const CLIENT_CARLOS: Client = {
  id: 1,
  name: 'Carlos',
  lastName: 'Perez',
  dni: '30111222',
  phone: '1122334455',
  active: true,
  isDebtor: false,
};

const ROUTINE_ACTIVE: Routine = { id: 5, name: 'Full Body A', goal: 'Hipertrofia', active: true };
const ROUTINE_VIGENTE: Routine = { id: 9, name: 'Hipertrofia B', goal: 'Ganar masa muscular', active: true };

const PAYMENT_RECENT: Payment = { id: 20, amount: 15000, date: '2026-09-01', paymentType: 'MONTHLY' };

function renderClientDetailPage(
  client: Client,
  data: { routines?: Routine[]; payments?: Payment[] } = {},
) {
  vi.mocked(getClientById).mockResolvedValue(client);
  vi.mocked(getClientRoutines).mockResolvedValue(data.routines ?? []);
  vi.mocked(getClientPayments).mockResolvedValue(data.payments ?? []);
  vi.mocked(getClientAssistance).mockResolvedValue([]);
  vi.mocked(getClientProductsPurchased).mockResolvedValue([]);
  vi.mocked(getPhysicalRecords).mockResolvedValue([]);

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/clients/${client.id}`]}>
        <Routes>
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/clients" element={<div>Lista de alumnos</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// La spec (§A.3) pide una lista de definición (dl) para DNI/Teléfono/Rutina actual. Escoparla
// via querySelector('dl') evita confundirla con la sección "Datos Personales" que ya existe más
// abajo en la página y no se toca en esta spec.
function headerDataList(): HTMLElement {
  const dl = document.querySelector('dl');
  expect(dl).not.toBeNull();
  return dl as HTMLElement;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// AC-0007-01: el único h1 de la página tiene el nombre completo, y la lista de datos
// (DNI, Teléfono, Rutina actual) aparece después del h1 en el orden del documento.
describe('ClientDetailPage - encabezado con nombre y datos (AC-0007-01)', () => {
  it('el h1 muestra el nombre completo y la lista de datos aparece después en el documento', async () => {
    renderClientDetailPage(CLIENT_CARLOS, { routines: [ROUTINE_ACTIVE], payments: [PAYMENT_RECENT] });

    const h1 = await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const dl = headerDataList();
    expect(h1.compareDocumentPosition(dl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(within(dl).getByText('DNI')).toBeInTheDocument();
    expect(within(dl).getByText('Teléfono')).toBeInTheDocument();
    expect(within(dl).getByText('Rutina actual')).toBeInTheDocument();
  });
});

// AC-0007-02: el avatar muestra las iniciales de nombre y apellido; con apellido vacío,
// muestra una sola inicial y no rompe.
describe('ClientDetailPage - iniciales del avatar (AC-0007-02)', () => {
  it('muestra "CP" para Carlos Perez', async () => {
    renderClientDetailPage(CLIENT_CARLOS);
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    expect(screen.getByText('CP')).toBeInTheDocument();
  });

  it('muestra "A" para un alumno con apellido vacío', async () => {
    renderClientDetailPage({ ...CLIENT_CARLOS, name: 'Ana', lastName: '' });
    await screen.findByRole('heading', { level: 1, name: 'Ana' });

    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

// AC-0007-03: las etiquetas de estado ("Activo"/"Inactivo") y de cuota ("Cuota al día"/"Cuota
// vencida") reflejan client.active y client.isDebtor por separado.
describe('ClientDetailPage - etiquetas de estado y cuota (AC-0007-03)', () => {
  it('muestra "Activo" y "Cuota al día" para un alumno activo y al día', async () => {
    renderClientDetailPage({ ...CLIENT_CARLOS, active: true, isDebtor: false });
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Cuota al día')).toBeInTheDocument();
  });

  it('muestra "Inactivo" y "Cuota vencida" para un alumno inactivo y deudor', async () => {
    renderClientDetailPage({ ...CLIENT_CARLOS, active: false, isDebtor: true });
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByText('Cuota vencida')).toBeInTheDocument();
  });
});

// AC-0007-04: "Rutina actual" muestra el nombre de la rutina activa o "Sin rutina asignada";
// "Teléfono" muestra "-" si el alumno no tiene teléfono cargado.
describe('ClientDetailPage - rutina actual y teléfono (AC-0007-04)', () => {
  it('"Rutina actual" muestra el nombre de la rutina activa del alumno', async () => {
    renderClientDetailPage(
      { ...CLIENT_CARLOS, routineActive: { id: ROUTINE_ACTIVE.id, name: ROUTINE_ACTIVE.name, goal: ROUTINE_ACTIVE.goal } },
      { routines: [ROUTINE_ACTIVE] },
    );
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    const dl = headerDataList();
    const dt = within(dl).getByText('Rutina actual');
    expect(dt.nextElementSibling).toHaveTextContent('Full Body A');
  });

  it('H-0007-1-02: con dos rutinas asignadas ("active" de plantilla en ambas), muestra la vigente (client.routineActive), no la primera de la lista', async () => {
    renderClientDetailPage(
      { ...CLIENT_CARLOS, routineActive: { id: ROUTINE_VIGENTE.id, name: ROUTINE_VIGENTE.name, goal: ROUTINE_VIGENTE.goal } },
      { routines: [ROUTINE_ACTIVE, ROUTINE_VIGENTE] },
    );
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    const dl = headerDataList();
    const dt = within(dl).getByText('Rutina actual');
    expect(dt.nextElementSibling).toHaveTextContent('Hipertrofia B');
  });

  it('"Rutina actual" muestra "Sin rutina asignada" si el alumno no tiene rutina activa', async () => {
    renderClientDetailPage(CLIENT_CARLOS, { routines: [] });
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    const dl = headerDataList();
    const dt = within(dl).getByText('Rutina actual');
    expect(dt.nextElementSibling).toHaveTextContent('Sin rutina asignada');
  });

  it('"Teléfono" muestra "-" si el alumno no tiene teléfono', async () => {
    renderClientDetailPage({ ...CLIENT_CARLOS, phone: '' });
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    const dl = headerDataList();
    const dt = within(dl).getByText('Teléfono');
    expect(dt.nextElementSibling).toHaveTextContent('-');
  });
});

// AC-0007-05: el link "Alumnos" del encabezado navega a /clients.
describe('ClientDetailPage - link a la lista de alumnos (AC-0007-05)', () => {
  it('hacer clic en "Alumnos" navega a /clients', async () => {
    const user = userEvent.setup();
    renderClientDetailPage(CLIENT_CARLOS);
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    await user.click(screen.getByRole('link', { name: /Alumnos/i }));

    await screen.findByText('Lista de alumnos');
  });
});

// AC-0007-06: las 7 pestañas siguen presentes, y clic en "Pagos" muestra su contenido y marca
// la pestaña activa con aria-selected (o aria-current).
describe('ClientDetailPage - pestañas (AC-0007-06)', () => {
  it('las 7 pestañas están presentes y clic en "Pagos" muestra el contenido y la marca como activa', async () => {
    const user = userEvent.setup();
    renderClientDetailPage(CLIENT_CARLOS, { payments: [PAYMENT_RECENT] });
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    const tabNames = [
      'General',
      'Pagos',
      'Rutinas',
      'Progreso',
      'Nutrición y Hábitos',
      'Asistencias',
      'Compras',
    ];
    tabNames.forEach((name) => expect(screen.getByRole('button', { name })).toBeInTheDocument());

    const pagosTab = screen.getByRole('button', { name: 'Pagos' });
    await user.click(pagosTab);

    expect(await screen.findByText('Historial de Pagos')).toBeInTheDocument();
    const marcada =
      pagosTab.getAttribute('aria-selected') === 'true' || pagosTab.hasAttribute('aria-current');
    expect(marcada).toBe(true);
  });
});
