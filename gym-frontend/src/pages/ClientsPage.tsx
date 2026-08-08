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
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'debtors'>(initialFilter);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);
  const [selectedClientForRoutine, setSelectedClientForRoutine] = useState<Client | null>(null);

  // La query pasa página, tamaño, término de búsqueda y filtros al backend
  const { data: pageData, isLoading, isError } = useQuery({
    queryKey: ['clients', page, pageSize, searchTerm, filterStatus],
    queryFn: async () => {
      const activeParam = filterStatus === 'all' ? undefined : (filterStatus === 'inactive' ? false : (filterStatus === 'active' ? true : undefined));
      const debtorsParam = filterStatus === 'debtors';
      return await getClients(page, pageSize, searchTerm, activeParam, debtorsParam);
    }
  });

  const clients = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;
  const totalElements = pageData?.totalElements || 0;

  // MUTACIONES: Crear y Editar
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20"> 
      
      {/* HEADER + BOTÓN ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-black font-display uppercase tracking-tight text-slate-900">Directorio de Alumnos</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Gestión integral de socios • Total: <strong className="text-emerald-700 font-mono font-bold">{totalElements}</strong> registrados
          </p>
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // Reiniciar a página 0 al buscar
            }}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all text-sm font-medium"
          />
        </div>

        {/* Filtros (Pills) */}
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shrink-0 self-start w-full md:w-auto overflow-x-auto whitespace-nowrap shadow-sm">
          <button
            onClick={() => { setFilterStatus('all'); setPage(0); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => { setFilterStatus('active'); setPage(0); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => { setFilterStatus('inactive'); setPage(0); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'inactive' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactivos
          </button>
          <button
            onClick={() => { setFilterStatus('debtors'); setPage(0); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              filterStatus === 'debtors' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Deudores
          </button>
        </div>
      </div>

      {/* ESTADOS DE CARGA / ERROR */}
      {isLoading && <p className="text-center text-slate-500 font-bold py-12">Cargando alumnos paginados...</p>}
      {isError && <p className="text-center text-rose-600 font-bold py-12">Error al cargar los alumnos.</p>}

      {/* LISTA DE ALUMNOS (GRID) */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="grid gap-3">
            {clients.length > 0 ? (
              clients.map((cliente: Client) => (
                <ClientItem 
                  key={cliente.id} 
                  client={cliente} 
                  onEdit={() => handleEditClient(cliente)}
                  onAssignRoutine={() => handleOpenAssignModal(cliente)}
                />
              ))
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm text-slate-400 font-medium">
                No se encontraron alumnos con los criterios seleccionados.
              </div>
            )}
          </div>

          {/* BARRA DE PAGINACIÓN */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span>Mostrar</span>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>por página</span>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 0} 
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="rounded-xl min-w-[90px] text-xs font-bold"
              >
                Anterior
              </Button>
              
              <span className="text-xs font-extrabold text-slate-700">
                Página <strong className="text-emerald-700 font-mono">{page + 1}</strong> de <strong className="font-mono">{totalPages}</strong>
              </span>

              <Button 
                variant="outline" 
                size="sm"
                disabled={page >= totalPages - 1} 
                onClick={() => setPage(prev => prev + 1)}
                className="rounded-xl min-w-[90px] text-xs font-bold"
              >
                Siguiente
              </Button>
            </div>
          </div>
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