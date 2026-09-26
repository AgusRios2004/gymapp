import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import MonthlyTypesPage from './MonthlyTypesPage';
import { getMonthlyTypes } from '../services/monthlyTypeService';

vi.mock('../services/monthlyTypeService');

// Spec 0009: el precio del plan salía con toLocaleString() sin locale ($20,000 en inglés).
describe('MonthlyTypesPage - precio del plan en formato argentino (spec 0009)', () => {
  it('AC-0009-06: un plan de 20000 muestra $20.000 en su tarjeta', async () => {
    vi.mocked(getMonthlyTypes).mockResolvedValue([{ id: 4, type: 'Plan Full', price: 20000, durationDays: 30 }]);
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MonthlyTypesPage />
      </QueryClientProvider>,
    );

    await screen.findByText('Plan Full');
    expect(screen.getByText('$20.000')).toBeInTheDocument();
  });
});
