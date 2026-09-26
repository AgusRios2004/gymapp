import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';
import { getDashboardStats } from '../services/dashboardService';

vi.mock('../services/dashboardService');

// Spec 0008: el nombre del PDF de cierre tomaba la fecha UTC; a las 22:40 decía el día siguiente.
describe('DashboardPage - nombre del PDF de cierre en hora local (spec 0008)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-24T22:40:00-03:00'));
    vi.mocked(getDashboardStats).mockResolvedValue({
      totalClients: 10,
      activeClients: 8,
      totalProfessors: 2,
      totalRoutines: 3,
      monthlyRevenue: 150000,
      lowStockCount: 0,
      debtorsCount: 1,
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['%PDF']) }));
    // jsdom no implementa createObjectURL/revokeObjectURL.
    URL.createObjectURL = vi.fn(() => 'blob:reporte');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('AC-0008-11: a las 22:40 el PDF se descarga como Reporte_Cierre_Mes_2026-09-24.pdf', async () => {
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(await screen.findByRole('button', { name: /Reportes PDF/ }));

    await vi.waitFor(() => expect(downloads).toHaveLength(1));
    expect(downloads[0]).toBe('Reporte_Cierre_Mes_2026-09-24.pdf');
  });
});

// Spec 0009: los montos del dashboard salían con toLocaleString() sin locale ($150,000) y el
// promedio con toFixed(0), sin separador de miles.
describe('DashboardPage - montos en formato argentino (spec 0009)', () => {
  it('AC-0009-05: ingresos del mes $150.000 y promedio por alumno activo $18.750', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      totalClients: 10,
      activeClients: 8,
      totalProfessors: 2,
      totalRoutines: 3,
      monthlyRevenue: 150000,
      lowStockCount: 0,
      debtorsCount: 1,
    });
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const revenueCard = (await screen.findByText('Ingresos del Mes')).parentElement!;
    expect(revenueCard).toHaveTextContent('$150.000');
    const averageBox = screen.getByText('Promedio Ingresos/Cliente').parentElement!;
    expect(averageBox).toHaveTextContent('$18.750');
  });
});
