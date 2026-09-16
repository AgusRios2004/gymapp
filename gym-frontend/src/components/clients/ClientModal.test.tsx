import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ClientModal from './ClientModal';

// T-09: el DNI es obligatorio (ClientSchema.dni ya lo exige); sin él, el submit no debe llamar a
// onSave y el campo debe mostrar el error de Zod.
describe('ClientModal - DNI obligatorio (T-09)', () => {
  it('sin DNI no llama a onSave y muestra el error en el campo', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<ClientModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByPlaceholderText('Ej. Juan'), 'Juan');
    await user.type(screen.getByPlaceholderText('Ej. Pérez'), 'Pérez');
    await user.type(screen.getByPlaceholderText('Teléfono'), '1122334455');

    await user.click(screen.getByRole('button', { name: /Guardar Alumno/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(await screen.findByText('El DNI es requerido')).toBeInTheDocument();
  });

  it('con todos los campos completos llama a onSave con los datos cargados', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<ClientModal isOpen={true} onClose={vi.fn()} onSave={onSave} />);

    await user.type(screen.getByPlaceholderText('Ej. Juan'), 'Juan');
    await user.type(screen.getByPlaceholderText('Ej. Pérez'), 'Pérez');
    await user.type(screen.getByPlaceholderText('DNI'), '30111222');
    await user.type(screen.getByPlaceholderText('Teléfono'), '1122334455');

    await user.click(screen.getByRole('button', { name: /Guardar Alumno/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Juan', lastName: 'Pérez', dni: '30111222', phone: '1122334455' }),
    );
  });
});
