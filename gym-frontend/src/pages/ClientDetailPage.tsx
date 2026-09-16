import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('general');
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
    enabled: !!clientId && (activeTab === 'routines' || activeTab === 'general')
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header con navegación hacia atrás */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/clients')}
            className="rounded-2xl w-11 h-11 p-0 flex items-center justify-center text-slate-600 border-slate-200 hover:bg-slate-100 min-w-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-black font-display uppercase tracking-tight text-slate-900">{client.name} {client.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client.active ? 'success' : 'danger'}>
                {client.active ? 'Socio Activo' : 'Socio Inactivo'}
              </Badge>
              <span className="text-slate-500 text-xs font-semibold">• DNI: {client.dni}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button 
             variant="primary" 
             size="lg"
             onClick={() => setIsAssignRoutineModalOpen(true)}
             className="w-full sm:w-auto px-8 min-w-[200px] gap-2 rounded-2xl shadow-lg shadow-emerald-600/25 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold"
           >
             <Dumbbell size={18} /> Asignar Rutina
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl overflow-x-auto no-scrollbar shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
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
                        {client.active ? "Al día" : "Inactivo"}
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
                      {payments.length > 0 ? `$${payments[0].amount.toLocaleString()}` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl border border-teal-200"><Dumbbell size={18} /></div>
                      <span className="text-xs font-semibold text-slate-700">Rutina Activa</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {routines.find(r => r.active)?.name || 'Ninguna'}
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
                        onClick={() => {
                          if(confirm('¿Estás seguro de eliminar este registro?')) {
                            deleteRecordMutation.mutate(record.id);
                          }
                        }}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <h3 className="text-xl font-black font-display uppercase tracking-tight text-white">Historial de Asistencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assistance.length === 0 ? (
                <p className="col-span-full text-center py-8 text-zinc-500">No hay registros de asistencia</p>
              ) : (
                assistance.map((a, idx) => (
                  <div key={idx} className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl flex items-center gap-4 shadow-industrial">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase">{new Date(a.date).toLocaleString('es-ES', { month: 'short' })}</span>
                      <span className="text-lg font-black text-white">{new Date(a.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white capitalize">{new Date(a.date).toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock size={12} className="text-amber-400" /> {a.inputHour} hs
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
            <h3 className="text-xl font-black font-display uppercase tracking-tight text-white">Compras en el Gimnasio</h3>
            <div className="bg-zinc-900/80 rounded-3xl border border-zinc-800/90 shadow-industrial p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  <tr className="border-b border-zinc-800">
                    <th className="pb-4 px-2">Producto</th>
                    <th className="pb-4">Fecha</th>
                    <th className="pb-4">Cant.</th>
                    <th className="pb-4">Precio Unit.</th>
                    <th className="pb-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {products.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No ha realizado compras</td></tr>
                  ) : (
                    products.map((p, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-4 px-2 font-semibold text-zinc-100 text-xs">{p.nameProduct}</td>
                        <td className="py-4 text-xs text-zinc-400">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-4 text-xs text-zinc-200">{p.quantity}</td>
                        <td className="py-4 text-xs text-zinc-300 font-mono">${p.price.toLocaleString()}</td>
                        <td className="py-4 font-black text-amber-400 font-mono text-sm">${(p.price * p.quantity).toLocaleString()}</td>
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
            <div className="grid grid-cols-3 gap-4">
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
    </div>
  );
}
