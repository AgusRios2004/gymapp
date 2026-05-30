import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Dumbbell, TrendingUp, DollarSign, Tag, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../services/dashboardService';
import type { DashboardStats } from '../types/index';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const StatCard = ({ title, value, icon, color, description }: StatCardProps) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{description}</p>
      </div>
      <div className={`p-3 rounded-2xl ${color} text-white`}>
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
    return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">Cargando estadísticas...</div>;
  }

  if (isError || !stats) {
    return <div className="text-center py-12 text-red-500">Error al cargar estadísticas. Por favor intenta más adelante.</div>;
  }

  const chartData = [
    { name: 'Ene', ingresos: Math.round(stats.monthlyRevenue * 0.7) },
    { name: 'Feb', ingresos: Math.round(stats.monthlyRevenue * 0.85) },
    { name: 'Mar', ingresos: Math.round(stats.monthlyRevenue * 0.75) },
    { name: 'Abr', ingresos: Math.round(stats.monthlyRevenue * 0.9) },
    { name: 'May', ingresos: stats.monthlyRevenue },
  ];

  const handleDownloadReport = async () => {
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
      } else {
        toast.error("Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Error al conectar con el servidor");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Resumen general de tu centro deportivo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="Total Alumnos"
          value={stats.totalClients}
          icon={<Users size={24} />}
          color="bg-blue-500"
          description="Socios registrados en el sistema"
        />
        <StatCard 
          title="Alumnos Activos"
          value={stats.activeClients}
          icon={<UserCheck size={24} />}
          color="bg-green-500"
          description="Socios con membresía al día"
        />
        <StatCard 
          title="Rutinas"
          value={stats.totalRoutines}
          icon={<Dumbbell size={24} />}
          color="bg-purple-500"
          description="Planes de entrenamiento creados"
        />
        <StatCard 
          title="Ingresos del Mes"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="bg-amber-500"
          description="Recaudación mensual total"
        />
        <StatCard 
          title="Deudores"
          value={stats.debtorsCount}
          icon={<AlertCircle size={24} />}
          color="bg-red-500"
          description="Alumnos con pago vencido"
        />
      </div>

      {stats.lowStockCount > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
              <Tag size={20} />
              <p className="font-medium">Atención: Tienes {stats.lowStockCount} productos con stock crítico.</p>
           </div>
           <Link to="/products" className="text-red-700 dark:text-red-400 font-bold hover:underline">Gestionar Stock →</Link>
        </div>
      )}

      {stats.debtorsCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-4 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
              <Users size={20} />
              <p className="font-medium">Atención: Hay {stats.debtorsCount} alumnos con la cuota vencida o sin pagar.</p>
           </div>
           <Link to="/clients?filter=debtors" className="text-amber-700 dark:text-amber-400 font-bold hover:underline">Ver Alumnos →</Link>
        </div>
      )}

      {/* Recharts Area Chart */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-emerald-500 pl-3">Evolución de Ingresos</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', border: 'none', color: '#fff' }} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos ($)" stroke="#10B981" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-500 pl-3">Estado de la Comunidad</h3>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
          <div className="space-y-6">
             <div>
                <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-600 dark:text-gray-400 font-medium">Actividad de Clientes</span>
                   <span className="text-gray-900 dark:text-white font-bold">{((stats.activeClients / (stats.totalClients || 1)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                   <div 
                     className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                     style={{ width: `${(stats.activeClients / (stats.totalClients || 1)) * 100}%` }}
                   ></div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                   <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Profesores</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProfessors}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                   <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Promedio Ingresos/Cliente</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-white">
                     ${(stats.monthlyRevenue / (stats.activeClients || 1)).toFixed(0)}
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-purple-500 pl-3">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/clients" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors border border-gray-100 dark:border-slate-700">
              <div className="p-2 bg-blue-500 text-white rounded-xl"><Users size={20} /></div>
              <span className="font-medium text-gray-800 dark:text-gray-200">Gestionar Alumnos</span>
            </Link>
            <Link to="/payments" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors border border-gray-100 dark:border-slate-700">
              <div className="p-2 bg-amber-500 text-white rounded-xl"><DollarSign size={20} /></div>
              <span className="font-medium text-gray-800 dark:text-gray-200">Registrar Pago</span>
            </Link>
            <Link to="/routines" className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors border border-gray-100 dark:border-slate-700">
              <div className="p-2 bg-purple-500 text-white rounded-xl"><Dumbbell size={20} /></div>
              <span className="font-medium text-gray-800 dark:text-gray-200">Nueva Rutina</span>
            </Link>
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors border border-gray-100 dark:border-slate-700 text-left w-full"
            >
              <div className="p-2 bg-pink-500 text-white rounded-xl"><TrendingUp size={20} /></div>
              <span className="font-medium text-gray-800 dark:text-gray-200">Reportes PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
