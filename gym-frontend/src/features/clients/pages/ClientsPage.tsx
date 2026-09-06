import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { z } from 'zod';
import type { Client } from '../../../types/index';
import { ClientItem } from '../components/ClientItem';
import ClientModal from '../components/ClientModal';
import AssignRoutineModal from '../../routines/components/AssignRoutineModal';
import { useClients } from '../hooks/useClients';
import { ClientSchema, AssignRoutineSchema } from '../../../types/schema.type.ts'; 
import Button from '../../../components/ui/Button';
import type { Assistance } from '../../../types/index';

type ClientFormData = z.infer<typeof ClientSchema>;
type AssignRoutineFormData = z.infer<typeof AssignRoutineSchema>;

export default function ClientsPage() {
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get('filter') as 'all' | 'active' | 'inactive' | 'debtors') || 'active';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'debtors'>(initialFilter);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);
  const [selectedClientForRoutine, setSelectedClientForRoutine] = useState<Client | null>(null);

  const {
    assistanceToday,
    clients,
    isLoadingClients,
    isErrorClients,
    markAttendance,
    createClient,
    isCreatingClient,
    updateClient,
    isUpdatingClient,
    assignRoutine,
    isAssigningRoutine
  } = useClients(filterStatus);

  const handleNewClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      lastName: client.lastName,
      dni: client.dni,
      phone: client.phone,
      active: client.active,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleOpenAssignModal = (client: Client) => {
    setSelectedClientForRoutine(client);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedClientForRoutine(null);
  };

  const handleSave = (data: ClientFormData) => {
    if (editingClient?.id) {
      updateClient(Number(editingClient.id), data, handleCloseModal);
    } else {
      createClient(data, handleCloseModal);
    }
  };

  const handleSaveAssignment = (data: AssignRoutineFormData) => {
    assignRoutine(data, handleCloseAssignModal);
  };

  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch = `${client.name} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (filterStatus === 'all' || filterStatus === 'debtors') ? true : (filterStatus === 'active' ? client.active : !client.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20"> {/* pb-20 para dar espacio en móvil si hay nav abajo */}
      
      {/* HEADER + BOTÓN ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Alumnos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Listado general de socios</p>
        </div>
        
        <Button 
          onClick={handleNewClient}
          size="lg" // Usamos el tamaño grande (h-12) para mejor tacto en móvil
          className="w-full sm:w-auto rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 gap-2"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Alumno</span>
        </Button>
      </div>

      {/* CONTROLES: BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar alumno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Filtros (Pills) */}
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl shrink-0 self-start w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-450 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'active' ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-450 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'inactive' ? 'bg-white dark:bg-slate-700 text-red-500 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-450 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Inactivos
          </button>
          <button
            onClick={() => setFilterStatus('debtors')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'debtors' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-gray-500 dark:text-gray-450 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Deudores
          </button>
        </div>
      </div>

      {/* ESTADOS DE CARGA / ERROR */}
      {isLoadingClients && <p className="text-center text-gray-500 py-8">Cargando alumnos...</p>}
      {isErrorClients && <p className="text-center text-red-500 py-8">Error al cargar los alumnos.</p>}

      {/* LISTA DE ALUMNOS (GRID) */}
      {!isLoadingClients && !isErrorClients && (
        <div className="grid gap-3">
          {filteredClients.length > 0 ? (
            filteredClients.map((cliente: Client) => {
              const isMarked = assistanceToday.some((a: Assistance) => a.idClient === cliente.id);
              return (
                <ClientItem 
                  key={cliente.id} 
                  client={cliente} 
                  onEdit={() => handleEditClient(cliente)}
                  onAssignRoutine={() => handleOpenAssignModal(cliente)}
                  onMarkAttendance={() => markAttendance(cliente.id)}
                  isMarkedToday={isMarked}
                />
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">No se encontraron alumnos.</p>
          )}
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEditing={!!editingClient}
        initialData={editingClient}
        isLoading={isCreatingClient || isUpdatingClient}
        onSave={handleSave}
      />

      <AssignRoutineModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        client={selectedClientForRoutine}
        onSave={handleSaveAssignment}
        isLoading={isAssigningRoutine}
      />
    </div>
  );
}