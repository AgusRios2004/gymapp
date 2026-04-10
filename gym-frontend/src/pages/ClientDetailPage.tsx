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
  TrendingUp
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
import { getPhysicalRecords, createPhysicalRecord } from '../services/physicalRecordService';
import type { PhysicalRecord } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import AssignRoutineModal from '../components/routines/AssignRoutineModal';

type TabType = 'general' | 'payments' | 'routines' | 'assistance' | 'products' | 'progress';

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
    { id: 'assistance', label: 'Asistencias', icon: <Calendar size={18} /> },
    { id: 'products', label: 'Compras', icon: <ShoppingBag size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header con navegación hacia atrás */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/clients')}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name} {client.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={client.active ? 'success' : 'danger'}>
                {client.active ? 'Socio Activo' : 'Socio Inactivo'}
              </Badge>
              <span className="text-gray-400 text-sm">• DNI: {client.dni}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="primary" 
             onClick={() => setIsAssignRoutineModalOpen(true)}
             className="gap-2 rounded-2xl shadow-lg shadow-blue-500/20"
           >
             <Dumbbell size={18} /> Asignar Rutina
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Nombre Completo</p>
                  <p className="text-gray-900 font-medium">{client.name} {client.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">DNI / ID</p>
                  <p className="text-gray-900 font-medium">{client.dni}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Teléfono</p>
                  <p className="text-gray-900 font-medium">{client.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Estado Cuenta</p>
                  <div className="flex items-center gap-1">
                    {client.active ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                    <span className={client.active ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {client.active ? "Al día" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Resumen Reciente</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={18} /></div>
                    <span className="text-sm font-medium text-gray-700">Último Pago</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {payments.length > 0 ? `$${payments[0].amount.toLocaleString()}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Dumbbell size={18} /></div>
                    <span className="text-sm font-medium text-gray-700">Rutina Activa</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {routines.find(r => r.active)?.name || 'Ninguna'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-400 uppercase font-bold">
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 px-2">Fecha</th>
                    <th className="pb-4">Concepto</th>
                    <th className="pb-4">Monto</th>
                    <th className="pb-4">Cobrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">No hay pagos registrados</td></tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-2 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-4 font-medium text-gray-900">{p.monthlyTypeName || 'Producto'}</td>
                        <td className="py-4 text-gray-900 font-bold">${p.amount.toLocaleString()}</td>
                        <td className="py-4 text-sm text-gray-500">{p.professorName}</td>
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
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-gray-900">Planes de Entrenamiento</h3>
               <Button variant="outline" size="sm" onClick={() => setIsAssignRoutineModalOpen(true)} className="gap-2">
                 <Plus size={16} /> Nueva Asignación
               </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {routines.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No hay rutinas asignadas</p>
              ) : (
                routines.map((r) => (
                  <div key={r.id} className={`p-6 rounded-2xl border ${r.active ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="font-bold text-gray-900">{r.name}</h4>
                       {r.active && <Badge variant="success">ACTIVA</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{r.goal}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600">Ver Ejercicios</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Evolución Física</h3>
              <Button onClick={() => setIsRecordModalOpen(true)} className="gap-2">
                <Plus size={18} /> Nuevo Registro
              </Button>
            </div>

            {physicalRecords.length > 1 ? (
              <div className="h-80 w-full bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...physicalRecords].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      tick={{fontSize: 12, fill: '#999'}}
                    />
                    <YAxis tick={{fontSize: 12, fill: '#999'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="muscleMass" name="Masa Muscular" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : physicalRecords.length === 1 ? (
              <div className="p-8 bg-blue-50 rounded-3xl text-center">
                 <p className="text-blue-600 font-medium">Registra al menos 2 medidas para ver el gráfico de evolución.</p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {physicalRecords.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                   <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                   <p>No hay registros físicos aún</p>
                </div>
              ) : (
                physicalRecords.map((record) => (
                  <div key={record.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                       <span className="text-sm font-bold text-gray-900">{new Date(record.date).toLocaleDateString()}</span>
                       <Badge variant="neutral">Medición</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Peso</p>
                          <p className="text-lg font-black text-blue-600">{record.weight}kg</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Músculo</p>
                          <p className="text-lg font-black text-green-600">{record.muscleMass}%</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Grasa</p>
                          <p className="text-lg font-black text-amber-600">{record.fatPercentage}%</p>
                       </div>
                    </div>
                    {record.notes && (
                      <p className="text-xs text-gray-500 italic border-t border-gray-50 pt-3">{record.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'assistance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Historial de Asistencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assistance.length === 0 ? (
                <p className="col-span-full text-center py-8 text-gray-400">No hay registros de asistencia</p>
              ) : (
                assistance.map((a, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-500 uppercase">{new Date(a.date).toLocaleString('es-ES', { month: 'short' })}</span>
                      <span className="text-lg font-bold text-gray-900">{new Date(a.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{new Date(a.date).toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {a.inputHour} hs
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
            <h3 className="text-xl font-bold text-gray-900">Compras en el Gimnasio</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-400 uppercase font-bold">
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 px-2">Producto</th>
                    <th className="pb-4">Fecha</th>
                    <th className="pb-4">Cant.</th>
                    <th className="pb-4">Precio Unit.</th>
                    <th className="pb-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No ha realizado compras</td></tr>
                  ) : (
                    products.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-2 font-medium text-gray-900">{p.nameProduct}</td>
                        <td className="py-4 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="py-4 text-sm text-gray-900">{p.quantity}</td>
                        <td className="py-4 text-sm text-gray-900">${p.price.toLocaleString()}</td>
                        <td className="py-4 font-bold text-gray-900">${(p.price * p.quantity).toLocaleString()}</td>
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
