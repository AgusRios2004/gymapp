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
import { ClientSchema, AssignRoutineSchema } from '../types/schema.type'; 
import Button from '../components/ui/Button';

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
    <div className="max-w-6xl mx-auto space-y-6 pb-20"> 
      
      {/* HEADER + BOTÓN ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-black font-display uppercase tracking-tight text-slate-900">Directorio de Alumnos</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Gestión integral de socios, estado de cuenta y rutinas</p>
        </div>
        
        <Button 
          onClick={handleNewClient}
          size="lg" 
          className="w-full sm:w-auto px-8 min-w-[200px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-95 gap-2"
        >
          <Plus size={20} />
          <span>Nuevo Alumno</span>
        </Button>
      </div>

      {/* CONTROLES: BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar alumno por nombre, apellido o DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all text-sm font-medium"
          />
        </div>

        {/* Filtros (Pills) */}
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shrink-0 self-start w-full md:w-auto overflow-x-auto whitespace-nowrap shadow-sm">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'inactive' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactivos
          </button>
          <button
            onClick={() => setFilterStatus('debtors')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'debtors' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-600 hover:text-slate-900'
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
            filteredClients.map((cliente: Client) => (
              <ClientItem 
                key={cliente.id} 
                client={cliente} 
                onEdit={() => handleEditClient(cliente)}
                onAssignRoutine={() => handleOpenAssignModal(cliente)}
              />
            ))
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