import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  Plus,
  Calendar, 
  CreditCard, 
  Dumbbell, 
  User, 
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trash2,
  Utensils
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getClientById } from '../services/clientService';
import { 
  getClientAssistance, 
  getClientPayments, 
  getClientRoutines, 
  getClientProductsPurchased 
} from '../services/clientInfoService';
import { getPhysicalRecords, createPhysicalRecord, deletePhysicalRecord } from '../services/physicalRecordService';
import type { PhysicalRecord } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import AssignRoutineModal from '../components/routines/AssignRoutineModal';
import RecompositionWidget from '../components/physical/RecompositionWidget';
import TrainingSchemeWidget from '../components/routines/TrainingSchemeWidget';
import { HydrationTracker } from '../components/HydrationTracker';
import { SupplementTracker } from '../components/SupplementTracker';
import { ClientNutritionTab } from '../components/ClientNutritionTab';


type TabType = 'general' | 'payments' | 'routines' | 'assistance' | 'products' | 'progress' | 'nutrition';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [recordToDelete, setRecordToDelete] = useState<PhysicalRecord | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    weight: '',
    muscleMass: '',
    fatPercentage: '',
    notes: ''
  });
  const [isAssignRoutineModalOpen, setIsAssignRoutineModalOpen] = useState(false);

  const clientId = Number(id);

  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientById(clientId),
    enabled: !!clientId
  });

  const { data: assistance = [] } = useQuery({
    queryKey: ['client-assistance', clientId],
    queryFn: () => getClientAssistance(clientId),
    enabled: !!clientId && activeTab === 'assistance'
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['client-payments', clientId],
    queryFn: () => getClientPayments(clientId),
    enabled: !!clientId && (activeTab === 'payments' || activeTab === 'general')
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['client-routines', clientId],
    queryFn: () => getClientRoutines(clientId),
    enabled: !!clientId && activeTab === 'routines'
  });

  const { data: products = [] } = useQuery({
    queryKey: ['client-products', clientId],
    queryFn: () => getClientProductsPurchased(clientId),
    enabled: !!clientId && activeTab === 'products'
  });

  const { data: physicalRecords = [] } = useQuery({
    queryKey: ['client-physical', clientId],
    queryFn: () => getPhysicalRecords(clientId),
    enabled: !!clientId && activeTab === 'progress'
  });

  const recordMutation = useMutation({
    mutationFn: (data: Partial<PhysicalRecord>) => createPhysicalRecord(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-physical', clientId] });
      toast.success("📈 Progreso registrado");
      setIsRecordModalOpen(false);
      setRecordForm({ weight: '', muscleMass: '', fatPercentage: '', notes: '' });
    },
    onError: () => toast.error("❌ Error al guardar registro")
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: number) => deletePhysicalRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-physical', clientId] });
      toast.success("🗑️ Registro eliminado");
      setRecordToDelete(null);
    },
    onError: () => toast.error("❌ Error al eliminar registro")
  });

  if (isLoadingClient) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Cargando información del alumno...</div>;
  }

  if (!client) {
    return <div className="text-center py-12 text-red-500">No se encontró el alumno.</div>;
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <User size={18} /> },
    { id: 'payments', label: 'Pagos', icon: <CreditCard size={18} /> },
    { id: 'routines', label: 'Rutinas', icon: <Dumbbell size={18} /> },
    { id: 'progress', label: 'Progreso', icon: <TrendingUp size={18} /> },
    { id: 'nutrition', label: 'Nutrición y Hábitos', icon: <Utensils size={18} /> },
    { id: 'assistance', label: 'Asistencias', icon: <Calendar size={18} /> },
    { id: 'products', label: 'Compras', icon: <ShoppingBag size={18} /> },
  ];

  const activeRoutine = client.routineActive ?? null;
  // findByClientId no tiene ORDER BY: el array llega en orden de inserción, no por fecha.
  const latestPayment = payments.length > 0
    ? payments.reduce((latest, p) => (new Date(p.date) > new Date(latest.date) ? p : latest))
    : null;
  const initials = [client.name, client.lastName]
    .filter(Boolean)
    .map((n) => n.trim().charAt(0).toUpperCase())
    .join('');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-4">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link
              to="/clients"
              className="inline-flex items-center gap-1 min-h-11 -ml-2 px-2 rounded-xl text-slate-600 hover:text-emerald-700 font-bold"
            >
              <ChevronLeft size={16} /> Alumnos
            </Link>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="hidden sm:inline text-slate-500 font-medium">{client.name} {client.lastName}</span>
          </nav>

          <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-14 w-14 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black font-display text-lg">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 break-words">
                  {client.name} {client.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                    <span className={`h-2 w-2 rounded-full ${client.active ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                    <span className={client.active ? 'text-emerald-700' : 'text-rose-600'}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                    {client.isDebtor ? (
                      <XCircle size={14} className="text-rose-500" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    )}
                    <span className={client.isDebtor ? 'text-rose-600' : 'text-emerald-700'}>
                      {client.isDebtor ? 'Cuota vencida' : 'Cuota al día'}
                    </span>
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-3">
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-slate-500">DNI</dt>
                    <dd className="text-slate-900 font-semibold text-sm mt-0.5">{client.dni}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Teléfono</dt>
                    <dd className="text-slate-900 font-semibold text-sm mt-0.5">{client.phone || '-'}</dd>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Rutina actual</dt>
                    <dd className="text-slate-900 font-semibold text-sm mt-0.5">
                      {activeRoutine ? activeRoutine.name : 'Sin rutina asignada'}
                    </dd>
                  </div>
                  <div className="hidden sm:block">
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Último pago</dt>
                    <dd className="text-slate-900 font-semibold text-sm mt-0.5">
                      {latestPayment ? `$${latestPayment.amount.toLocaleString()}` : '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsAssignRoutineModalOpen(true)}
                className="w-full sm:w-auto px-8 gap-2 rounded-2xl shadow-lg shadow-emerald-600/25 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold"
              >
                <Dumbbell size={18} /> Asignar rutina
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative border-t border-slate-100 px-2 sm:px-6">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                aria-selected={activeTab === tab.id}
                className={`min-h-11 flex items-center gap-2 px-4 border-b-2 text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-700 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <RecompositionWidget 
              client={client} 
              latestWeight={physicalRecords.length > 0 ? physicalRecords[0].weight : undefined}
              latestFat={physicalRecords.length > 0 ? physicalRecords[0].fatPercentage : undefined}
              latestMuscle={physicalRecords.length > 0 ? physicalRecords[0].muscleMass : undefined}
            />
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-3">Datos Personales</h3>
                <div className="grid grid-cols-2 gap-6 bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Nombre Completo</p>
                    <p className="text-slate-900 font-semibold">{client.name} {client.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">DNI / ID</p>
                    <p className="text-slate-900 font-semibold">{client.dni}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Teléfono</p>
                    <p className="text-slate-900 font-semibold">{client.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Estado Cuenta</p>
                    <div className="flex items-center gap-1.5">
                      {client.active ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-600" />}
                      <span className={client.active ? "text-emerald-700 font-bold text-xs" : "text-rose-700 font-bold text-xs"}>
                        {client.active ? "Cuenta activa" : "Cuenta inactiva"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900 border-l-4 border-teal-600 pl-3">Resumen Reciente</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200"><CreditCard size={18} /></div>
                      <span className="text-xs font-semibold text-slate-700">Último Pago</span>
                    </div>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {latestPayment ? `$${latestPayment.amount.toLocaleString()}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl border border-teal-200"><Dumbbell size={18} /></div>
                      <span className="text-xs font-semibold text-slate-700">Rutina Activa</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {activeRoutine?.name || 'Ninguna'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900">Historial de Pagos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 px-2">Fecha</th>
                    <th className="pb-4">Concepto</th>
                    <th className="pb-4">Monto</th>
                    <th className="pb-4">Cobrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">No hay pagos registrados</td></tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 text-xs text-slate-600 font-medium">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-4 font-semibold text-slate-900 text-xs">{p.monthlyTypeName || 'Producto'}</td>
                        <td className="py-4 text-emerald-700 font-mono font-black text-sm">${p.amount.toLocaleString()}</td>
                        <td className="py-4 text-xs text-slate-500">{p.professorName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'routines' && (
          <div className="space-y-6">
            <TrainingSchemeWidget />
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900">Planes de Entrenamiento Asignados</h3>
                <Button variant="outline" size="sm" onClick={() => setIsAssignRoutineModalOpen(true)} className="gap-2 text-emerald-700 border-emerald-300 bg-emerald-50/50">
                  <Plus size={16} /> Nueva Asignación
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {routines.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">No hay rutinas asignadas</p>
                ) : (
                  routines.map((r) => (
                    <div key={r.id} className={`p-6 rounded-2xl border ${r.active ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 text-base">{r.name}</h4>
                        {r.active && <Badge variant="success">ACTIVA</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mb-4">{r.goal}</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800">Ver Ejercicios</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <RecompositionWidget 
              client={client} 
              latestWeight={physicalRecords.length > 0 ? physicalRecords[0].weight : undefined}
              latestFat={physicalRecords.length > 0 ? physicalRecords[0].fatPercentage : undefined}
              latestMuscle={physicalRecords.length > 0 ? physicalRecords[0].muscleMass : undefined}
            />
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900">Evolución Física</h3>
                <Button onClick={() => setIsRecordModalOpen(true)} className="gap-2">
                  <Plus size={18} /> Nuevo Registro
                </Button>
              </div>

              {physicalRecords.length > 1 ? (
                <div className="h-80 w-full bg-slate-50 p-4 rounded-3xl border border-slate-200/80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...physicalRecords].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                        tick={{fontSize: 12, fill: '#64748b'}}
                      />
                      <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a' }}
                      />
                      <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="muscleMass" name="Masa Muscular (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                      <Line type="monotone" dataKey="fatPercentage" name="Grasa (%)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: '#f43f5e' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : physicalRecords.length === 1 ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center">
                  <p className="text-emerald-700 font-semibold text-xs">Registra al menos 2 medidas para ver el gráfico de evolución.</p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {physicalRecords.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <TrendingUp size={48} className="mx-auto mb-4 opacity-20 text-emerald-600" />
                    <p className="text-xs">No hay registros físicos aún</p>
                  </div>
                ) : (
                  physicalRecords.map((record) => (
                    <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all group relative">
                      <button
                        onClick={() => setRecordToDelete(record)}
                        className="absolute top-2 right-2 min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-rose-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-bold text-slate-900">{new Date(record.date).toLocaleDateString()}</span>
                        <Badge variant="neutral">Medición</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Peso</p>
                          <p className="text-base font-black text-emerald-700 font-mono">{record.weight}kg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Músculo</p>
                          <p className="text-base font-black text-emerald-600 font-mono">{record.muscleMass}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Grasa</p>
                          <p className="text-base font-black text-rose-500 font-mono">{record.fatPercentage}%</p>
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-2.5">{record.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HydrationTracker clientId={clientId} />
              <SupplementTracker clientId={clientId} />
            </div>
            <ClientNutritionTab clientId={clientId} />
          </div>
        )}

        {activeTab === 'assistance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900">Historial de Asistencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assistance.length === 0 ? (
                <p className="col-span-full text-center py-8 text-slate-400">No hay registros de asistencia</p>
              ) : (
                assistance.map((a, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase">{new Date(a.date).toLocaleString('es-ES', { month: 'short' })}</span>
                      <span className="text-lg font-black text-slate-900">{new Date(a.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 capitalize">{new Date(a.date).toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {a.inputHour} hs
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900">Compras en el Gimnasio</h3>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  <tr className="border-b border-slate-200">
                    <th className="pb-4 px-2">Producto</th>
                    <th className="pb-4">Fecha</th>
                    <th className="pb-4">Cant.</th>
                    <th className="pb-4">Precio Unit.</th>
                    <th className="pb-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">No ha realizado compras</td></tr>
                  ) : (
                    products.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 font-semibold text-slate-800 text-xs">{p.nameProduct}</td>
                        <td className="py-4 text-xs text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-4 text-xs text-slate-700">{p.quantity}</td>
                        <td className="py-4 text-xs text-slate-600 font-mono">${p.price.toLocaleString()}</td>
                        <td className="py-4 font-black text-emerald-600 font-mono text-sm">${(p.price * p.quantity).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Nuevo Registro Físico">
         <form onSubmit={(e) => {
           e.preventDefault();
           recordMutation.mutate({
             ...recordForm,
             weight: Number(recordForm.weight),
             muscleMass: Number(recordForm.muscleMass),
             fatPercentage: Number(recordForm.fatPercentage),
             date: new Date().toISOString().split('T')[0]
           });
         }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <Input label="Peso (kg)" type="number" step="0.1" required value={recordForm.weight} onChange={e => setRecordForm({...recordForm, weight: e.target.value})} />
               <Input label="Músculo (%)" type="number" step="0.1" required value={recordForm.muscleMass} onChange={e => setRecordForm({...recordForm, muscleMass: e.target.value})} />
               <Input label="Grasa (%)" type="number" step="0.1" required value={recordForm.fatPercentage} onChange={e => setRecordForm({...recordForm, fatPercentage: e.target.value})} />
            </div>
            <Input label="Notas / Observaciones" value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} />
            <div className="flex gap-3 pt-6">
               <Button variant="outline" type="button" className="flex-1" onClick={() => setIsRecordModalOpen(false)}>Cancelar</Button>
               <Button type="submit" className="flex-1" isLoading={recordMutation.isPending}>Guardar</Button>
            </div>
         </form>
      </Modal>

      <AssignRoutineModal
        isOpen={isAssignRoutineModalOpen}
        onClose={() => setIsAssignRoutineModalOpen(false)}
        client={client}
      />

      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => recordToDelete && deleteRecordMutation.mutate(recordToDelete.id)}
        variant="danger"
        title="¿Eliminar Registro?"
        description="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        isLoading={deleteRecordMutation.isPending}
      />
    </div>
  );
}
