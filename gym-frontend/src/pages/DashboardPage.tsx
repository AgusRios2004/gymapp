import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Dumbbell, TrendingUp, DollarSign, Tag, AlertCircle, GraduationCap, PackageX } from 'lucide-react';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../types/index';
import { todayLocalISO } from '../utils/date';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const StatCard = ({ title, value, icon, color, description }: StatCardProps) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">{value}</h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
      </div>
      <div className={`p-3.5 rounded-2xl ${color} text-white shadow-md`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-bold">Cargando estadísticas...</div>;
  }

  if (isError || !stats) {
    return <div className="text-center py-12 text-rose-600 font-bold">Error al cargar estadísticas. Por favor intenta más adelante.</div>;
  }

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reports/monthly`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Cierre_Mes_${todayLocalISO()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl font-black font-display uppercase tracking-tight text-slate-900">Dashboard General</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Resumen del centro deportivo, estadísticas clave e indicadores de rendimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Alumnos"
          value={stats.totalClients}
          icon={<Users size={24} />}
          color="bg-emerald-600"
          description="Socios registrados en el sistema"
        />
        <StatCard
          title="Alumnos Activos"
          value={stats.activeClients}
          icon={<UserCheck size={24} />}
          color="bg-teal-600"
          description="Socios con membresía al día"
        />
        <StatCard
          title="Profesores"
          value={stats.totalProfessors}
          icon={<GraduationCap size={24} />}
          color="bg-sky-600"
          description="Profesores dados de alta"
        />
        <StatCard
          title="Rutinas"
          value={stats.totalRoutines}
          icon={<Dumbbell size={24} />}
          color="bg-violet-600"
          description="Planes de entrenamiento creados"
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="bg-emerald-700"
          description="Recaudación mensual total"
        />
        <StatCard
          title="Deudores"
          value={stats.debtorsCount}
          icon={<AlertCircle size={24} />}
          color="bg-rose-600"
          description="Alumnos con pago vencido"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockCount}
          icon={<PackageX size={24} />}
          color="bg-amber-600"
          description="Productos con stock crítico"
        />
      </div>

      {stats.lowStockCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3 text-rose-800 font-bold text-sm">
              <Tag size={20} className="text-rose-600" />
              <p>Atención: Tienes {stats.lowStockCount} productos con stock crítico.</p>
           </div>
           <Link to="/products" className="inline-flex items-center min-h-11 text-rose-700 font-extrabold hover:underline text-xs uppercase tracking-wider">Gestionar Stock →</Link>
        </div>
      )}

      {stats.debtorsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-3 text-amber-900 font-bold text-sm">
              <Users size={20} className="text-amber-600" />
              <p>Atención: Hay {stats.debtorsCount} alumnos con la cuota vencida o sin pagar.</p>
           </div>
           <Link to="/clients?filter=debtors" className="inline-flex items-center min-h-11 text-amber-800 font-extrabold hover:underline text-xs uppercase tracking-wider">Ver Alumnos →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-3">Estado de la Comunidad</h3>
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <div className="space-y-6">
             <div>
                <div className="flex justify-between text-sm mb-2 font-bold">
                   <span className="text-slate-600">Actividad de Clientes</span>
                   <span className="text-emerald-700 font-mono">{((stats.activeClients / (stats.totalClients || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
                   <div 
                     className="bg-emerald-600 h-full rounded-full transition-all duration-1000" 
                     style={{ width: `${(stats.activeClients / (stats.totalClients || 1)) * 100}%` }}
                   ></div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
                   <p className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-1">Profesores</p>
                   <p className="text-3xl font-black text-slate-900 font-mono">{stats.totalProfessors}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60">
                   <p className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-1">Promedio Ingresos/Cliente</p>
                   <p className="text-3xl font-black text-emerald-700 font-mono">
                     ${(stats.monthlyRevenue / (stats.activeClients || 1)).toFixed(0)}
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900 border-l-4 border-teal-600 pl-3">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/clients" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-slate-200/80 group">
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform"><Users size={20} /></div>
              <span className="font-extrabold text-slate-900 text-sm">Gestionar Alumnos</span>
            </Link>
            <Link to="/payments" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-slate-200/80 group">
              <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform"><DollarSign size={20} /></div>
              <span className="font-extrabold text-slate-900 text-sm">Registrar Pago</span>
            </Link>
            <Link to="/routines" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-slate-200/80 group">
              <div className="p-3 bg-violet-600 text-white rounded-xl shadow-md shadow-violet-600/20 group-hover:scale-105 transition-transform"><Dumbbell size={20} /></div>
              <span className="font-extrabold text-slate-900 text-sm">Nueva Rutina</span>
            </Link>
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-slate-200/80 text-left w-full group"
            >
              <div className="p-3 bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform"><TrendingUp size={20} /></div>
              <span className="font-extrabold text-slate-900 text-sm">Reportes PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
