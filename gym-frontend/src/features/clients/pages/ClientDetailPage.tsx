import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Dumbbell, 
  User, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  ShoppingBag 
} from 'lucide-react';
import { 
  useClientDetail, 
  useClientAssistance, 
  useClientPayments, 
  useClientRoutines, 
  useClientProducts, 
  useClientPhysicalRecords, 
  useCreatePhysicalRecord, 
  useDeletePhysicalRecord 
} from '../hooks/useClientDetail';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import AssignRoutineModal from '../../routines/components/AssignRoutineModal';

import { ClientGeneralTab } from '../components/ClientGeneralTab';
import { ClientPaymentsTab } from '../components/ClientPaymentsTab';
import { ClientRoutinesTab } from '../components/ClientRoutinesTab';
import { ClientProgressTab } from '../components/ClientProgressTab';
import { ClientAssistanceTab } from '../components/ClientAssistanceTab';
import { ClientProductsTab } from '../components/ClientProductsTab';

type TabType = 'general' | 'payments' | 'routines' | 'assistance' | 'products' | 'progress';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isAssignRoutineModalOpen, setIsAssignRoutineModalOpen] = useState(false);

  const clientId = Number(id);

  // Queries using custom hooks
  const { data: client, isLoading: isLoadingClient } = useClientDetail(clientId);
  const { data: assistance = [] } = useClientAssistance(clientId, activeTab === 'assistance');
  const { data: payments = [] } = useClientPayments(clientId, activeTab === 'payments' || activeTab === 'general');
  const { data: routines = [] } = useClientRoutines(clientId, activeTab === 'routines' || activeTab === 'general');
  const { data: products = [] } = useClientProducts(clientId, activeTab === 'products');
  const { data: physicalRecords = [] } = useClientPhysicalRecords(clientId, activeTab === 'progress');

  // Mutation using custom hook
  const createRecordMutation = useCreatePhysicalRecord(clientId);
  const deleteRecordMutation = useDeletePhysicalRecord(clientId);

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
          <ClientGeneralTab 
            client={client} 
            payments={payments} 
            routines={routines} 
          />
        )}

        {activeTab === 'payments' && (
          <ClientPaymentsTab 
            payments={payments} 
          />
        )}

        {activeTab === 'routines' && (
          <ClientRoutinesTab 
            routines={routines} 
            onAssignRoutineClick={() => setIsAssignRoutineModalOpen(true)} 
          />
        )}

        {activeTab === 'progress' && (
          <ClientProgressTab 
            clientId={clientId}
            physicalRecords={physicalRecords} 
            onCreateRecord={(data, onSuccess) => createRecordMutation.mutate(data, { onSuccess })} 
            onDeleteRecord={(id) => deleteRecordMutation.mutate(id)} 
            isPending={createRecordMutation.isPending}
          />
        )}

        {activeTab === 'assistance' && (
          <ClientAssistanceTab 
            assistance={assistance} 
          />
        )}

        {activeTab === 'products' && (
          <ClientProductsTab 
            products={products} 
          />
        )}
      </div>

      <AssignRoutineModal 
        isOpen={isAssignRoutineModalOpen}
        onClose={() => setIsAssignRoutineModalOpen(false)}
        client={client}
      />
    </div>
  );
}

