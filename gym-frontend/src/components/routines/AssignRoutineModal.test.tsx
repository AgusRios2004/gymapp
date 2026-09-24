import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import AssignRoutineModal from './AssignRoutineModal';
import { getRoutines, assignRoutineToClient } from '../../services/routineService';
import { getClientRoutines } from '../../services/clientInfoService';
import type { Client, Routine } from '../../types';

vi.mock('../../services/routineService');
vi.mock('../../services/clientInfoService');
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const CLIENT: Client = {
  id: 7,
  name: 'Carla',
  lastName: 'Gomez',
  dni: '40111222',
  phone: '1155667788',
  active: true,
};

const TEMPLATE_FUERZA: Routine = { id: 1, name: 'Fuerza Full Body', goal: 'Hipertrofia', active: true };
const TEMPLATE_GRASA: Routine = { id: 2, name: 'Pérdida de grasa', goal: 'Reducción de grasa corporal', active: true };
const TEMPLATE_CARDIO: Routine = { id: 3, name: 'Cardio HIIT', goal: 'Resistencia cardiovascular', active: true };

const TEMPLATES = [TEMPLATE_FUERZA, TEMPLATE_GRASA, TEMPLATE_CARDIO];

const TEMPLATE_MULTIDIA: Routine = {
  id: 4,
  name: 'Full Body A',
  goal: 'Fuerza general',
  active: true,
  days: [
    { id: 10, dayOrder: 1, routineExercises: [] },
    { id: 11, dayOrder: 2, routineExercises: [] },
  ],
};

function renderModal(
  overrides: { templates?: Routine[]; clientRoutines?: Routine[]; client?: Client } = {},
) {
  vi.mocked(getRoutines).mockResolvedValue(overrides.templates ?? TEMPLATES);
  vi.mocked(getClientRoutines).mockResolvedValue(overrides.clientRoutines ?? []);
  const onClose = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AssignRoutineModal isOpen client={overrides.client ?? CLIENT} onClose={onClose} />
    </QueryClientProvider>,
  );
  return { onClose, queryClient };
}

// Cada tarjeta de plantilla lleva role="radio" (spec §B.8); ubicarla por su nombre evita depender
// del orden en que la lista las renderiza.
function cardFor(group: HTMLElement, templateName: string): HTMLElement {
  const card = within(group).getByText(templateName).closest('[role="radio"]');
  if (!card) {
    throw new Error(`No se encontró la tarjeta de "${templateName}" con role="radio"`);
  }
  return card as HTMLElement;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// AC-0007-08: con 3 plantillas, el modal renderiza un radiogroup con 3 radio, cada uno con el
// nombre y el objetivo de su plantilla, y ninguno elegido al abrir.
describe('AssignRoutineModal - lista de plantillas como radiogroup (AC-0007-08)', () => {
  it('renderiza un radiogroup con una tarjeta por plantilla, sin ninguna elegida', async () => {
    renderModal();

    const group = await screen.findByRole('radiogroup');
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(3);

    expect(within(group).getByText('Fuerza Full Body')).toBeInTheDocument();
    expect(within(group).getByText('Hipertrofia')).toBeInTheDocument();
    expect(within(group).getByText('Pérdida de grasa')).toBeInTheDocument();
    expect(within(group).getByText('Reducción de grasa corporal')).toBeInTheDocument();
    expect(within(group).getByText('Cardio HIIT')).toBeInTheDocument();
    expect(within(group).getByText('Resistencia cardiovascular')).toBeInTheDocument();

    radios.forEach((radio) => expect(radio).toHaveAttribute('aria-checked', 'false'));
  });
});

// H-0007-1-01: la plantilla de varios días debe poder agendarse por día de la semana y ese
// mapeo tiene que viajar en `schedule`; si no, la agenda semanal del alumno queda vacía.
describe('AssignRoutineModal - agenda semanal al asignar una plantilla de varios días (H-0007-1-01)', () => {
  it('envía schedule con el día de la semana asignado a cada sesión de la rutina', async () => {
    vi.mocked(assignRoutineToClient).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ templates: [TEMPLATE_MULTIDIA] });

    const group = await screen.findByRole('radiogroup');
    await user.click(cardFor(group, 'Full Body A'));

    const selects = await screen.findAllByRole('combobox');
    expect(selects).toHaveLength(2);
    await user.selectOptions(selects[0], 'MONDAY');
    await user.selectOptions(selects[1], 'WEDNESDAY');

    await user.click(screen.getByRole('button', { name: 'Asignar rutina' }));

    await waitFor(() => expect(assignRoutineToClient).toHaveBeenCalledTimes(1));
    expect(assignRoutineToClient).toHaveBeenCalledWith(
      expect.objectContaining({
        schedule: [
          { dayOrder: 1, assignedDay: 'MONDAY' },
          { dayOrder: 2, assignedDay: 'WEDNESDAY' },
        ],
      }),
    );
  });
});

// AC-0007-09: la plantilla que coincide con la rutina activa del alumno muestra "Actual"; las
// demás no.
describe('AssignRoutineModal - etiqueta "Actual" (AC-0007-09)', () => {
  it('la plantilla que coincide con la rutina activa del alumno muestra "Actual"', async () => {
    renderModal({
      client: { ...CLIENT, routineActive: { id: TEMPLATE_GRASA.id, name: TEMPLATE_GRASA.name, goal: TEMPLATE_GRASA.goal } },
    });

    const group = await screen.findByRole('radiogroup');
    const grasaCard = cardFor(group, 'Pérdida de grasa');
    const fuerzaCard = cardFor(group, 'Fuerza Full Body');

    expect(within(grasaCard).getByText('Actual')).toBeInTheDocument();
    expect(within(fuerzaCard).queryByText('Actual')).not.toBeInTheDocument();
  });

  // H-0007-1-03: con dos rutinas asignadas al alumno ("active" de plantilla en ambas, ej. "Full
  // Body A" de marzo y "Hipertrofia B" de hoy), "Actual" tiene que ir en la vigente
  // (client.routineActive), no en la primera de `getClientRoutines`.
  it('H-0007-1-03: con dos rutinas del alumno, "Actual" va en la vigente (client.routineActive)', async () => {
    renderModal({
      client: { ...CLIENT, routineActive: { id: TEMPLATE_CARDIO.id, name: TEMPLATE_CARDIO.name, goal: TEMPLATE_CARDIO.goal } },
      clientRoutines: [
        { ...TEMPLATE_GRASA, active: true },
        { ...TEMPLATE_CARDIO, active: true },
      ],
    });

    const group = await screen.findByRole('radiogroup');
    const grasaCard = cardFor(group, 'Pérdida de grasa');
    const cardioCard = cardFor(group, 'Cardio HIIT');

    expect(within(cardioCard).getByText('Actual')).toBeInTheDocument();
    expect(within(grasaCard).queryByText('Actual')).not.toBeInTheDocument();
    expect(screen.getByText(/rutina actual: Cardio HIIT/)).toBeInTheDocument();
  });
});

// AC-0007-10: buscar filtra por nombre u objetivo sin distinguir mayúsculas; sin coincidencias
// muestra "No hay plantillas que coincidan".
describe('AssignRoutineModal - buscador de plantillas (AC-0007-10)', () => {
  it('filtra por nombre u objetivo sin distinguir mayúsculas', async () => {
    const user = userEvent.setup();
    renderModal();

    await screen.findByRole('radiogroup');
    await user.type(screen.getByPlaceholderText('Buscar plantilla'), 'grasa');

    const group = screen.getByRole('radiogroup');
    expect(within(group).getAllByRole('radio')).toHaveLength(1);
    expect(within(group).getByText('Pérdida de grasa')).toBeInTheDocument();
  });

  it('muestra "No hay plantillas que coincidan" si no hay resultados', async () => {
    const user = userEvent.setup();
    renderModal();

    await screen.findByRole('radiogroup');
    await user.type(screen.getByPlaceholderText('Buscar plantilla'), 'zzz-inexistente');

    expect(await screen.findByText('No hay plantillas que coincidan')).toBeInTheDocument();
  });
});

// AC-0007-11: sin plantilla elegida, los dos botones de asignar están deshabilitados y no se
// llama al servicio.
describe('AssignRoutineModal - botones deshabilitados sin plantilla elegida (AC-0007-11)', () => {
  it('"Asignar rutina" y "Asignar y cargar otra" están deshabilitados y no llaman al servicio', async () => {
    renderModal();
    await screen.findByRole('radiogroup');

    expect(screen.getByRole('button', { name: 'Asignar rutina' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Asignar y cargar otra' })).toBeDisabled();
    expect(assignRoutineToClient).not.toHaveBeenCalled();
  });
});

// AC-0007-12: elegir una plantilla y hacer clic en "Asignar rutina" llama al servicio una vez con
// el id del alumno, el id de la plantilla, la fecha y las notas, y después cierra el modal.
describe('AssignRoutineModal - asignar y cerrar (AC-0007-12)', () => {
  it('llama a assignRoutineToClient con los datos elegidos y después cierra', async () => {
    vi.mocked(assignRoutineToClient).mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { onClose } = renderModal();

    const group = await screen.findByRole('radiogroup');
    await user.click(cardFor(group, 'Fuerza Full Body'));

    const today = new Date().toISOString().split('T')[0];
    await user.click(screen.getByRole('button', { name: 'Asignar rutina' }));

    await waitFor(() => expect(assignRoutineToClient).toHaveBeenCalledTimes(1));
    expect(assignRoutineToClient).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: CLIENT.id,
        routineTemplateId: TEMPLATE_FUERZA.id,
        startDate: today,
        notes: '',
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

// AC-0007-13: elegir una plantilla, cargar notas y hacer clic en "Asignar y cargar otra" llama al
// servicio una vez, no cierra, y deja la lista sin elegir y las notas vacías.
describe('AssignRoutineModal - asignar y cargar otra sin cerrar (AC-0007-13)', () => {
  it('asigna, no cierra, y deja la lista sin elegir y las notas vacías', async () => {
    vi.mocked(assignRoutineToClient).mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { onClose } = renderModal();

    const group = await screen.findByRole('radiogroup');
    await user.click(cardFor(group, 'Fuerza Full Body'));
    await user.type(screen.getByPlaceholderText('Indicaciones para el alumno'), 'Notas de prueba');

    await user.click(screen.getByRole('button', { name: 'Asignar y cargar otra' }));

    await waitFor(() => expect(assignRoutineToClient).toHaveBeenCalledTimes(1));
    expect(assignRoutineToClient).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: CLIENT.id,
        routineTemplateId: TEMPLATE_FUERZA.id,
        notes: 'Notas de prueba',
      }),
    );
    expect(onClose).not.toHaveBeenCalled();

    await waitFor(() => {
      within(group)
        .getAllByRole('radio')
        .forEach((radio) => expect(radio).toHaveAttribute('aria-checked', 'false'));
    });
    expect(screen.getByPlaceholderText('Indicaciones para el alumno')).toHaveValue('');
  });
});

// AC-0007-14: si el backend rechaza, se muestra su mensaje en un toast, el modal no se cierra y
// la plantilla elegida sigue elegida.
describe('AssignRoutineModal - error del backend al asignar (AC-0007-14)', () => {
  it('muestra el mensaje de error, no cierra el modal y mantiene la plantilla elegida', async () => {
    vi.mocked(assignRoutineToClient).mockRejectedValue(new Error('El alumno ya tiene esta rutina asignada'));
    const user = userEvent.setup();
    const { onClose } = renderModal();

    const group = await screen.findByRole('radiogroup');
    const fuerzaCard = cardFor(group, 'Fuerza Full Body');
    await user.click(fuerzaCard);

    await user.click(screen.getByRole('button', { name: 'Asignar rutina' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('El alumno ya tiene esta rutina asignada'),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(fuerzaCard).toHaveAttribute('aria-checked', 'true');
  });
});

// AC-0007-15: ESC o el botón con aria-label="Cerrar" llaman a onClose.
describe('AssignRoutineModal - cerrar con ESC o con el botón de cerrar (AC-0007-15)', () => {
  it('ESC llama a onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await screen.findByRole('radiogroup');

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el botón con aria-label "Cerrar" llama a onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await screen.findByRole('radiogroup');

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// H-0007-2-02: "Rutina actual" del encabezado (ClientDetailPage) sale de la query ['client', id],
// no de ['client-routines'/'client-routine']. Si onSuccess no invalida esa query, el encabezado
// se queda con la rutina vieja hasta recargar la página.
describe('AssignRoutineModal - invalidación de la query del cliente tras asignar (H-0007-2-02)', () => {
  it('invalida la query ["client", id] además de las de rutinas', async () => {
    vi.mocked(assignRoutineToClient).mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { queryClient } = renderModal();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const group = await screen.findByRole('radiogroup');
    await user.click(cardFor(group, 'Fuerza Full Body'));
    await user.click(screen.getByRole('button', { name: 'Asignar rutina' }));

    await waitFor(() => expect(assignRoutineToClient).toHaveBeenCalledTimes(1));
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['client', CLIENT.id] }),
    );
  });
});
