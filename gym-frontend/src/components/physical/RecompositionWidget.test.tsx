import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import RecompositionWidget from './RecompositionWidget';
import type { Client } from '../../types';

function renderWidget(client: Client) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RecompositionWidget client={client} />
    </QueryClientProvider>,
  );
}

const CLIENT: Client = {
  id: 1,
  name: 'Carlos',
  lastName: 'Perez',
  dni: '30111222',
  phone: '1122334455',
  active: true,
  height: 1.78,
  targetWeight: 80,
  targetFatPercentage: 20,
  targetMuscleMass: 30,
};

// AC-0007-07: "1.78 m", "80 kg", "20%" y "30%" no se parten en dos renglones, y la meta
// ("Meta 80 kg") se renderiza en un elemento aparte del valor principal.
describe('RecompositionWidget - valores sin cortes y meta separada (AC-0007-07)', () => {
  it('cada valor principal tiene whitespace-nowrap y la meta está en un elemento aparte', () => {
    renderWidget(CLIENT);

    const heightValue = screen.getByText('1.78 m');
    const weightValue = screen.getByText('80 kg');
    const fatValue = screen.getByText('20%');
    const muscleValue = screen.getByText('30%');

    [heightValue, weightValue, fatValue, muscleValue].forEach((value) => {
      expect(value).toHaveClass('whitespace-nowrap');
    });

    const weightGoal = screen.getByText('Meta 80 kg');
    expect(weightGoal).not.toBe(weightValue);
  });
});
