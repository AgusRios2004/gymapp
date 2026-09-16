import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchableSelect } from './SearchableSelect';

interface Item {
  id: number;
  name: string;
}

const PEOPLE: Item[] = [
  { id: 1, name: 'Ramón Díaz' },
  { id: 2, name: 'RAMONA Paz' },
  { id: 3, name: 'Luis Gil' },
];

const TWELVE: Item[] = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Opción ${i + 1}` }));

// El componente es controlado: el padre guarda el valor. onChange es un spy que además lo actualiza,
// como haría una página real.
function renderSelect(options: Item[], props: { value?: Item | null; emptyMessage?: string } = {}) {
  const onChange = vi.fn();

  function Controlled() {
    const [value, setValue] = useState<Item | null>(props.value ?? null);
    return (
      <SearchableSelect<Item>
        label="Cliente"
        options={options}
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
        getLabel={(item) => item.name}
        getKey={(item) => item.id}
        emptyMessage={props.emptyMessage}
      />
    );
  }

  const utils = render(<Controlled />);
  return { ...utils, onChange };
}

// AC-0005-01: combobox accesible por label; al hacer click muestra un listbox con todas las opciones.
describe('SearchableSelect - apertura (AC-0005-01)', () => {
  it('abre un listbox con las 12 opciones al hacer click en el combobox "Cliente"', async () => {
    const user = userEvent.setup();
    renderSelect(TWELVE);

    const combobox = screen.getByRole('combobox', { name: 'Cliente' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(combobox);

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByRole('option')).toHaveLength(12);
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
  });
});

// AC-0005-02: el filtro no distingue mayúsculas ni tildes.
describe('SearchableSelect - filtro (AC-0005-02)', () => {
  it('"ramon" deja visibles "Ramón Díaz" y "RAMONA Paz", y oculta "Luis Gil"', async () => {
    const user = userEvent.setup();
    renderSelect(PEOPLE);

    await user.type(screen.getByRole('combobox', { name: 'Cliente' }), 'ramon');

    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['Ramón Díaz', 'RAMONA Paz']);
  });
});

// AC-0005-03: click en una opción llama a onChange con ese objeto, cierra y muestra el label.
describe('SearchableSelect - elegir con click (AC-0005-03)', () => {
  it('llama a onChange una vez con la opción, cierra el listbox y muestra su label', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE);
    const combobox = screen.getByRole('combobox', { name: 'Cliente' });

    await user.click(combobox);
    await user.click(screen.getByRole('option', { name: 'Luis Gil' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].id).toBe(3);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveValue('Luis Gil');
  });
});

// AC-0005-04: ↓ ↓ Enter elige la segunda opción visible; Escape cierra sin llamar a onChange.
describe('SearchableSelect - teclado (AC-0005-04)', () => {
  it('↓ ↓ Enter elige la segunda opción visible', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE);

    await user.click(screen.getByRole('combobox', { name: 'Cliente' }));
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].id).toBe(2);
  });

  it('Escape con la lista abierta la cierra sin llamar a onChange', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE);

    await user.click(screen.getByRole('combobox', { name: 'Cliente' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});

// AC-0005-05: sin resultados se muestra el mensaje y Enter no elige nada.
describe('SearchableSelect - sin resultados (AC-0005-05)', () => {
  it('muestra "Sin resultados" y Enter no llama a onChange', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE);

    await user.type(screen.getByRole('combobox', { name: 'Cliente' }), 'zzz');

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('usa el emptyMessage recibido', async () => {
    const user = userEvent.setup();
    renderSelect(PEOPLE, { emptyMessage: 'No hay clientes con ese dato' });

    await user.type(screen.getByRole('combobox', { name: 'Cliente' }), 'zzz');

    expect(screen.getByText('No hay clientes con ese dato')).toBeInTheDocument();
  });
});

// AC-0005-06: borrar el texto de un valor elegido llama a onChange(null); texto sin elegir y blur no
// cambia el valor y restaura el label.
describe('SearchableSelect - limpiar y abandonar (AC-0005-06)', () => {
  it('con un valor elegido, borrar todo el texto llama a onChange(null)', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE, { value: PEOPLE[2] });
    const combobox = screen.getByRole('combobox', { name: 'Cliente' });
    expect(combobox).toHaveValue('Luis Gil');

    await user.clear(combobox);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('escribir sin elegir y sacar el foco no llama a onChange y vuelve a mostrar el label actual', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE, { value: PEOPLE[2] });
    const combobox = screen.getByRole('combobox', { name: 'Cliente' });

    await user.click(combobox);
    await user.keyboard('{End} extra');
    expect(combobox).toHaveValue('Luis Gil extra');

    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(combobox).toHaveValue('Luis Gil');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('sin valor, escribir y sacar el foco deja el input vacío', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(PEOPLE);
    const combobox = screen.getByRole('combobox', { name: 'Cliente' });

    await user.type(combobox, 'Lu');
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(combobox).toHaveValue('');
  });
});

// AC-0005-07: si value cambia desde afuera a null, el input queda vacío.
describe('SearchableSelect - value controlado (AC-0005-07)', () => {
  it('refleja un reset externo del valor a null', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState<Item | null>(PEOPLE[0]);
      return (
        <>
          <SearchableSelect<Item>
            label="Cliente"
            options={PEOPLE}
            value={value}
            onChange={setValue}
            getLabel={(item) => item.name}
            getKey={(item) => item.id}
          />
          <button type="button" onClick={() => setValue(null)}>
            Reset
          </button>
        </>
      );
    }

    render(<Harness />);
    const combobox = screen.getByRole('combobox', { name: 'Cliente' });
    expect(combobox).toHaveValue('Ramón Díaz');

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(combobox).toHaveValue('');
  });
});
