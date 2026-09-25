import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import ClientDetailPage from './ClientDetailPage';
import { getClientById } from '../services/clientService';
import {
  getClientAssistance,
  getClientPayments,
  getClientRoutines,
  getClientProductsPurchased,
} from '../services/clientInfoService';
import { getPhysicalRecords, createPhysicalRecord } from '../services/physicalRecordService';
import type { Assistance, Client, PhysicalRecord, ProductPurchased, Routine, Payment } from '../types';

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
const PAYMENT_ENERO: Payment = { id: 5, amount: 10000, date: '2026-01-10', paymentType: 'MONTHLY' };
const PAYMENT_SEPTIEMBRE: Payment = { id: 21, amount: 15000, date: '2026-09-15', paymentType: 'MONTHLY' };

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

// H-0007-1-04: "Último pago" del encabezado tiene que ser el pago más reciente por fecha, no el
// primero del array (PaymentRepository.findByClientId no tiene ORDER BY, así que llega en orden
// de inserción/id).
describe('ClientDetailPage - "Último pago" del encabezado toma el más reciente por fecha (H-0007-1-04)', () => {
  it('muestra el monto del pago más reciente aunque llegue primero en el array', async () => {
    renderClientDetailPage(CLIENT_CARLOS, { payments: [PAYMENT_ENERO, PAYMENT_SEPTIEMBRE] });
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    const dl = headerDataList();
    const dt = within(dl).getByText('Último pago');
    expect(dt.nextElementSibling).toHaveTextContent(`$${PAYMENT_SEPTIEMBRE.amount.toLocaleString()}`);
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

// H-0007-2-05: "Resumen Reciente" (pestaña General) tiene que coincidir con el encabezado: el pago
// más reciente por fecha y la rutina vigente (client.routineActive), no payments[0] ni la primera
// rutina con active=true.
describe('ClientDetailPage - "Resumen Reciente" coincide con el encabezado (H-0007-2-05)', () => {
  function resumenValue(label: string): HTMLElement {
    const row = screen.getByText(label).closest('div.justify-between');
    if (!row) throw new Error(`No se encontró la fila "${label}" de Resumen Reciente`);
    return row.lastElementChild as HTMLElement;
  }

  it('muestra el pago más reciente y la rutina vigente', async () => {
    renderClientDetailPage(
      { ...CLIENT_CARLOS, routineActive: { id: ROUTINE_VIGENTE.id, name: ROUTINE_VIGENTE.name, goal: ROUTINE_VIGENTE.goal } },
      { payments: [PAYMENT_ENERO, PAYMENT_SEPTIEMBRE], routines: [ROUTINE_ACTIVE, ROUTINE_VIGENTE] },
    );
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    expect(resumenValue('Último Pago')).toHaveTextContent(`$${PAYMENT_SEPTIEMBRE.amount.toLocaleString()}`);
    expect(resumenValue('Rutina Activa')).toHaveTextContent('Hipertrofia B');
  });
});

// Spec 0008: las fechas LocalDate ('2026-09-24') se mostraban un día antes porque new Date() las
// toma como medianoche UTC, y el registro físico nuevo tomaba "hoy" en UTC.
describe('ClientDetailPage - fechas en hora local (spec 0008)', () => {
  const PAYMENT_24: Payment = { id: 30, amount: 18000, date: '2026-09-24', paymentType: 'MONTHLY' };
  const PURCHASE_24: ProductPurchased = { nameProduct: 'Proteína', date: '2026-09-24', price: 25000, quantity: 1 };
  const RECORD_24: PhysicalRecord = { id: 40, clientId: 1, date: '2026-09-24', weight: 80, muscleMass: 35, fatPercentage: 18 };
  const ASSISTANCE_24: Assistance = {
    idClient: 1,
    clientName: 'Carlos Perez',
    idProfessor: 9,
    professorName: 'Hugo Ibarra',
    date: '2026-09-24',
    inputHour: '19:30',
  };

  function inputByLabel(label: string): HTMLInputElement {
    return screen.getByText(label).parentElement!.querySelector('input')!;
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('AC-0008-10: un registro físico guardado a las 22:40 se envía con la fecha local', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-24T22:40:00-03:00'));
    const user = userEvent.setup();
    renderClientDetailPage(CLIENT_CARLOS);
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    await user.click(screen.getByRole('button', { name: 'Progreso' }));
    await user.click(await screen.findByRole('button', { name: /Nuevo Registro/ }));
    await user.type(inputByLabel('Peso (kg)'), '80');
    await user.type(inputByLabel('Músculo (%)'), '35');
    await user.type(inputByLabel('Grasa (%)'), '18');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await vi.waitFor(() => expect(createPhysicalRecord).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createPhysicalRecord).mock.calls[0][1]).toMatchObject({ date: '2026-09-24' });
  });

  it('AC-0008-14: las pestañas Pagos y Compras muestran la fecha del mismo día', async () => {
    const user = userEvent.setup();
    renderClientDetailPage(CLIENT_CARLOS, { payments: [PAYMENT_24] });
    vi.mocked(getClientProductsPurchased).mockResolvedValue([PURCHASE_24]);
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    await user.click(screen.getByRole('button', { name: 'Pagos' }));
    const paymentRow = (await screen.findByText('24/09/2026')).closest('tr')!;
    expect(paymentRow).not.toHaveTextContent('23/09');

    await user.click(screen.getByRole('button', { name: 'Compras' }));
    const purchaseRow = (await screen.findByText('Proteína')).closest('tr')!;
    expect(purchaseRow).toHaveTextContent('24/09/2026');
  });

  it('AC-0008-15: la lista de la pestaña Progreso muestra la fecha del mismo día', async () => {
    const user = userEvent.setup();
    renderClientDetailPage(CLIENT_CARLOS);
    vi.mocked(getPhysicalRecords).mockResolvedValue([RECORD_24]);
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    await user.click(screen.getByRole('button', { name: 'Progreso' }));

    expect(await screen.findByText('24/09/2026')).toBeInTheDocument();
  });

  it('AC-0008-16: la tarjeta de la asistencia muestra el día 24 y "jueves"', async () => {
    const user = userEvent.setup();
    renderClientDetailPage(CLIENT_CARLOS);
    vi.mocked(getClientAssistance).mockResolvedValue([ASSISTANCE_24]);
    await screen.findByRole('heading', { level: 1, name: 'Carlos Perez' });

    await user.click(screen.getByRole('button', { name: 'Asistencias' }));

    const card = (await screen.findByText(/19:30/)).closest('div.rounded-2xl') as HTMLElement;
    expect(within(card).getByText('24')).toBeInTheDocument();
    expect(within(card).getByText('jueves')).toBeInTheDocument();
  });
});
