import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

// Test de humo del runner (T-33): confirma que vitest, jsdom y Testing Library
// están bien cableados. Los tests de verdad los escribe cada spec.
describe('EmptyState', () => {
  it('muestra título, descripción y acción', () => {
    render(
      <EmptyState
        title="No hay clientes todavía"
        description="Creá el primero para empezar."
        action={<button>Nuevo cliente</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No hay clientes todavía' })).toBeInTheDocument();
    expect(screen.getByText('Creá el primero para empezar.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo cliente' })).toBeInTheDocument();
  });

  it('no renderiza descripción ni acción si no se pasan', () => {
    const { container } = render(<EmptyState title="Sin datos" />);

    expect(container.querySelector('p')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
