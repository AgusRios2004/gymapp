import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ClassesPage from './ClassesPage';
import { getClasses, createClass } from '../services/classService';
import { getProfessors } from '../services/professorService';
import { getRoutines } from '../services/routineService';
import { getAllClientsList } from '../services/clientService';
import { getAssistanceByDate } from '../services/assistanceService';
import type { GroupClass, Professor } from '../types';

vi.mock('../services/classService');
vi.mock('../services/professorService');
vi.mock('../services/routineService');
vi.mock('../services/clientService');
vi.mock('../services/assistanceService');

const PROFESSOR: Professor = {
  id: 9,
  name: 'Hugo',
  lastName: 'Ibarra',
  dni: '91111222',
  phone: '1188990011',
  active: true,
};

// Spec 0003: GroupClass todavía declara `dayOfWeek: string` (T3 lo reemplaza por `daysOfWeek:
// string[]`). Estos fixtures ya usan el contrato nuevo; el cast refleja que el tipo real
// (`GroupClass`) no lo soporta hasta esa tarea.
const CLASS_MONDAY_WEDNESDAY = {
  id: 1,
  className: 'Funcional',
  professor: PROFESSOR,
  daysOfWeek: ['MONDAY', 'WEDNESDAY'],
  startTime: '10:00',
  endTime: '11:00',
  capacity: 20,
};

// Se mantiene también el `dayOfWeek` viejo (MONDAY) para que la clase aparezca hoy en la vista
// semanal (que todavía filtra por ese campo, AC-0003-09) y así se pueda llegar al botón de editar;
// lo que este fixture ejercita es la precarga de checkboxes en el formulario (AC-0003-11), no la
// vista semanal.
const CLASS_MONDAY_FRIDAY = {
  id: 2,
  className: 'Spinning',
  professor: PROFESSOR,
  dayOfWeek: 'MONDAY',
  daysOfWeek: ['MONDAY', 'FRIDAY'],
  startTime: '18:00',
  endTime: '19:00',
  capacity: 15,
};

function renderClassesPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClassesPage />
    </QueryClientProvider>,
  );
}

function getDayColumn(dayLabel: string) {
  const heading = screen.getByRole('heading', { name: dayLabel });
  return heading.parentElement!.parentElement as HTMLElement;
}

function getClassCard(className: string) {
  const heading = screen.getByRole('heading', { level: 4, name: className });
  return heading.parentElement!.parentElement!.parentElement as HTMLElement;
}

beforeEach(() => {
  vi.mocked(getProfessors).mockResolvedValue([PROFESSOR]);
  vi.mocked(getRoutines).mockResolvedValue([]);
  vi.mocked(getAllClientsList).mockResolvedValue([]);
  vi.mocked(getAssistanceByDate).mockResolvedValue([]);
});

// AC-0003-09: una clase con daysOfWeek: ["MONDAY","WEDNESDAY"] aparece en las columnas Lunes y
// Miércoles de la vista semanal, y no en Martes. Hoy la vista filtra por `c.dayOfWeek === day`, que
// no existe en el fixture (ya migrado al contrato nuevo), así que la clase no aparece en ninguna
// columna.
describe('ClassesPage - vista semanal con varios días (AC-0003-09)', () => {
  it('muestra la clase en Lunes y Miércoles, y no en Martes', async () => {
    vi.mocked(getClasses).mockResolvedValue([CLASS_MONDAY_WEDNESDAY] as unknown as GroupClass[]);
    renderClassesPage();

    await waitFor(() => {
      expect(within(getDayColumn('Lunes')).getByText('Funcional')).toBeInTheDocument();
    });
    expect(within(getDayColumn('Miércoles')).getByText('Funcional')).toBeInTheDocument();
    expect(within(getDayColumn('Martes')).queryByText('Funcional')).not.toBeInTheDocument();
  });
});

// AC-0003-12: en el selector de clase del modal "Registro Rápido de Alumno", la opción de una clase
// con daysOfWeek: ["MONDAY","WEDNESDAY"] muestra "Lunes" y "Miércoles". Hoy esa opción arma el texto
// con `TRANSLATIONS[c.dayOfWeek]`, que no existe en el fixture.
describe('ClassesPage - selector de clase al asignar un alumno (AC-0003-12)', () => {
  it('la opción de la clase muestra Lunes y Miércoles', async () => {
    vi.mocked(getClasses).mockResolvedValue([CLASS_MONDAY_WEDNESDAY] as unknown as GroupClass[]);
    const user = userEvent.setup();
    renderClassesPage();

    await user.click(screen.getByRole('button', { name: /Nuevo Alumno/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Registro Rápido de Alumno')).toBeInTheDocument();

    const classOption = (await waitFor(() => {
      const options = within(dialog).getAllByRole('option');
      const found = options.find((option) => option.textContent?.includes('Funcional'));
      expect(found).toBeDefined();
      return found;
    }))!;

    expect(classOption.textContent).toContain('Lunes');
    expect(classOption.textContent).toContain('Miércoles');
  });
});

// AC-0003-10: en el formulario de nueva clase, elegir Lunes y Viernes y guardar llama a createClass
// con daysOfWeek que contiene MONDAY y FRIDAY; sin ningún día elegido, createClass no se llama. Hoy
// el día es un único <select> (siempre tiene un valor), así que no hay forma de "no elegir día", y
// no hay checkboxes por día para elegir varios.
describe('ClassesPage - formulario de nueva clase con varios días (AC-0003-10)', () => {
  function getProfessorSelect(dialog: HTMLElement) {
    // No se busca por posición: hoy el <select> de día ocupa el primer combobox del formulario, y
    // T4 lo reemplaza por checkboxes, corriendo el orden. Se ubica por el contenido de sus opciones.
    const professorSelect = within(dialog)
      .getAllByRole('combobox')
      .find((select) => within(select).queryByText(`${PROFESSOR.name} ${PROFESSOR.lastName}`));
    if (!professorSelect) {
      throw new Error('No se encontró el select de profesor en el formulario');
    }
    return professorSelect;
  }

  async function fillCommonFields(user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) {
    await user.type(within(dialog).getByRole('textbox'), 'Funcional');
    await user.selectOptions(getProfessorSelect(dialog), String(PROFESSOR.id));
  }

  it('sin ningún día elegido no llama a createClass', async () => {
    vi.mocked(getClasses).mockResolvedValue([]);
    const user = userEvent.setup();
    renderClassesPage();

    await user.click(screen.getByRole('button', { name: /Nueva Clase/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Programar Nueva Clase')).toBeInTheDocument();
    await fillCommonFields(user, dialog);

    await user.click(within(dialog).getByRole('button', { name: /Crear Clase/i }));

    expect(createClass).not.toHaveBeenCalled();
  });

  it('elegir Lunes y Viernes llama a createClass con daysOfWeek que contiene MONDAY y FRIDAY', async () => {
    vi.mocked(getClasses).mockResolvedValue([]);
    const user = userEvent.setup();
    renderClassesPage();

    await user.click(screen.getByRole('button', { name: /Nueva Clase/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Programar Nueva Clase')).toBeInTheDocument();
    await fillCommonFields(user, dialog);

    await user.click(within(dialog).getByRole('checkbox', { name: /Lunes/i }));
    await user.click(within(dialog).getByRole('checkbox', { name: /Viernes/i }));
    await user.click(within(dialog).getByRole('button', { name: /Crear Clase/i }));

    expect(createClass).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(createClass).mock.calls[0][0] as unknown as { daysOfWeek: string[] };
    expect(payload.daysOfWeek).toEqual(expect.arrayContaining(['MONDAY', 'FRIDAY']));
  });
});

// AC-0003-11: al abrir la edición de una clase con daysOfWeek: ["MONDAY","FRIDAY"], los controles de
// Lunes y Viernes aparecen marcados y el resto no. Hoy no hay controles por día (checkbox), solo un
// <select> de un único día.
describe('ClassesPage - formulario de edición precarga los días (AC-0003-11)', () => {
  it('marca Lunes y Viernes, y deja el resto sin marcar', async () => {
    vi.mocked(getClasses).mockResolvedValue([CLASS_MONDAY_FRIDAY] as unknown as GroupClass[]);
    const user = userEvent.setup();
    renderClassesPage();

    const card = await waitFor(() => getClassCard('Spinning'));
    const [editButton] = within(card).getAllByRole('button');
    await user.click(editButton);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Editar Clase')).toBeInTheDocument();

    expect(within(dialog).getByRole('checkbox', { name: /Lunes/i })).toBeChecked();
    expect(within(dialog).getByRole('checkbox', { name: /Viernes/i })).toBeChecked();
    expect(within(dialog).getByRole('checkbox', { name: /Martes/i })).not.toBeChecked();
  });
});
