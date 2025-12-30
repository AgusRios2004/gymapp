import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { Client } from '../types/index';
import { ClientItem } from '../components/clients/ClientItem';
import ClientModal from '../components/clients/ClientModal';
import { getClients, createClient, updateClient } from '../services/clientService';
import { ClientSchema } from '../types/schema.type'; 
import Button from '../components/ui/Button';

import { toast } from 'react-toastify';

type ClientFormData = z.infer<typeof ClientSchema>;

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  // 1. Estado inicial: Solo 'active' para no cargar todos al principio
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);

  // 2. La query ahora depende del filtro y pasa el parámetro al backend
  const { data: clients = [], isLoading, isError } = useQuery({
    queryKey: ['clients', filterStatus], // Al cambiar filterStatus, React Query refesca
    queryFn: async () => {
      // Mapeamos el estado del filtro a booleano o undefined para el servicio
      const activeParam = filterStatus === 'all' ? undefined : filterStatus === 'active';
      // Nota: Asegúrate de actualizar getClients en clientService.ts para aceptar este parámetro
      const data = await getClients(activeParam);
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

  const handleSave = (data: ClientFormData) => {
    if (editingClient?.id) {
      updateMutation.mutate({ id: Number(editingClient.id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filtrado
  const filteredClients = clients.filter((client: Client) => {
    // Solo filtramos por texto en el front, el estado ya viene filtrado del back
    const matchesSearch = `${client.name} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // (Opcional) Doble chequeo por seguridad, aunque el back ya lo hace
    const matchesStatus = filterStatus === 'all' ? true : (filterStatus === 'active' ? client.active : !client.active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20"> {/* pb-20 para dar espacio en móvil si hay nav abajo */}
      
      {/* HEADER + BOTÓN ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Alumnos</h1>
          <p className="text-gray-500 text-sm">Listado general de socios</p>
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
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>

        {/* Filtros (Pills) */}
        <div className="flex p-1 bg-gray-100 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'active' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 'inactive' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inactivos
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
    </div>
  );
}