import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../../../types';

export function useDashboard() {
  const statsQuery = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const downloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reports/monthly`, {
        headers
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Cierre_Mes_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("✅ Reporte descargado correctamente");
      } else {
        toast.error("❌ Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("❌ Error al conectar con el servidor");
    }
  };

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    isErrorStats: statsQuery.isError,
    downloadReport
  };
}
