import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { Client } from '../types/index';
import { ClientItem } from '../components/clients/ClientItem';
import ClientModal from '../components/clients/ClientModal';
import AssignRoutineModal from '../components/routines/AssignRoutineModal';
import { getClients, createClient, updateClient, assignRoutine } from '../services/clientService';
import { registerAssistance, getAssistanceByDate } from '../services/assistanceService';
import { useAuth } from '../context/AuthContext';
import { ClientSchema, AssignRoutineSchema } from '../types/schema.type'; 
import Button from '../components/ui/Button';
import type { Assistance } from '../types/index';

import { toast } from 'react-toastify';

type ClientFormData = z.infer<typeof ClientSchema>;
type AssignRoutineFormData = z.infer<typeof AssignRoutineSchema>;

export default function ClientsPage() {
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get('filter') as 'all' | 'active' | 'inactive' | 'debtors') || 'active';

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  // 1. Estado inicial: Solo 'active' o el extraído de la URL
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'debtors'>(initialFilter);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);
  const [selectedClientForRoutine, setSelectedClientForRoutine] = useState<Client | null>(null);

  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { data: assistanceToday = [] } = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  const assistanceMutation = useMutation({
    mutationFn: (clientId: number) => {
        const now = new Date();
        const inputHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return registerAssistance({
            idClient: clientId,
            idProfessor: user?.id || 0,
            date: today,
            inputHour: inputHour
        });
    },
    onMutate: async (clientId: number) => {
        await queryClient.cancelQueries({ queryKey: ['assistance', today] });
        const previousAssistance = queryClient.getQueryData<Assistance[]>(['assistance', today]) || [];
        const mockAssistance: Assistance = {
            idClient: clientId,
            clientName: '',
            idProfessor: user?.id || 0,
            professorName: '',
            date: today,
            inputHour: '00:00'
        };
        queryClient.setQueryData(['assistance', today], [...previousAssistance, mockAssistance]);
        return { previousAssistance };
    },
    onError: (error: any, _, context) => {
        if (context?.previousAssistance) {
            queryClient.setQueryData(['assistance', today], context.previousAssistance);
        }
        const message = error.response?.data?.message || "Error al registrar asistencia";
        toast.error(message);
    },
    onSuccess: () => {
        toast.success("✅ Asistencia registrada");
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['assistance', today] });
    }
  });

  // 2. La query ahora depende del filtro y pasa el parámetro al backend
  const { data: clients = [], isLoading, isError } = useQuery({
    queryKey: ['clients', filterStatus], // Al cambiar filterStatus, React Query refesca
    queryFn: async () => {
      // Mapeamos el estado del filtro a booleano o undefined para el servicio
      const activeParam = filterStatus === 'all' ? undefined : (filterStatus === 'inactive' ? false : (filterStatus === 'active' ? true : undefined));
      const debtorsParam = filterStatus === 'debtors';
      const data = await getClients(activeParam, debtorsParam);
      return Array.isArray(data) ? data : [];
    }
  });

  // 2. MUTACIONES: Crear y Editar
  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Alumno registrado correctamente");
      handleCloseModal();
    },
    onError: (error) => {
      console.error("Error al crear el cliente:", error);
      toast.error("Error al crear el cliente");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: ClientFormData }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Datos actualizados");
      handleCloseModal();
    },
    onError: (error) => {
      console.error("Error al actualizar el cliente:", error);
      toast.error("Error al actualizar el cliente");
    }
  });

  const assignRoutineMutation = useMutation({
    mutationFn: assignRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Rutina asignada correctamente");
      handleCloseAssignModal();
    },
    onError: (error) => {
      console.error("Error al asignar rutina:", error);
      toast.error("Error al asignar la rutina");
    }
  });

  const handleNewClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    // Adaptamos el objeto Client al formato del formulario si es necesario
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
      updateMutation.mutate({ id: Number(editingClient.id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSaveAssignment = (data: AssignRoutineFormData) => {
    assignRoutineMutation.mutate(data);
  };

  // Filtrado
  const filteredClients = clients.filter((client: Client) => {
    // Solo filtramos por texto en el front, el estado ya viene filtrado del back
    const matchesSearch = `${client.name} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // (Opcional) Doble chequeo por seguridad, aunque el back ya lo hace
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
      {isLoading && <p className="text-center text-gray-500 py-8">Cargando alumnos...</p>}
      {isError && <p className="text-center text-red-500 py-8">Error al cargar los alumnos.</p>}

      {/* LISTA DE ALUMNOS (GRID) */}
      {!isLoading && !isError && (
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
                  onMarkAttendance={() => assistanceMutation.mutate(cliente.id)}
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
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSave={handleSave}
      />

      <AssignRoutineModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        client={selectedClientForRoutine}
        onSave={handleSaveAssignment}
        isLoading={assignRoutineMutation.isPending}
      />
    </div>
  );
}