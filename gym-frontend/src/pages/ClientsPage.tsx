import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { Client } from '../types/index';
import { ClientItem } from '../components/clients/ClientItem';
import ClientModal from '../components/clients/ClientModal';
import { getClients, createClient, updateClient } from '../services/clientService';
import { ClientSchema } from '../types/schema.type'; 

// Inferimos el tipo para usarlo en el estado y mutaciones
type ClientFormData = z.infer<typeof ClientSchema>;

// Cambio de nombre para consistencia (Inglés en código)
export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);

  // 1. QUERY: Obtener clientes
  const { data: clients = [], isLoading, isError } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // 2. Descomentamos la llamada real a la API
      const data = await getClients();
      return Array.isArray(data) ? data : [];
    }
  });

  // 2. MUTACIONES: Crear y Editar
  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      handleCloseModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: ClientFormData }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      handleCloseModal();
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
  const filteredClients = clients.filter((client: Client) => 
    `${client.name} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20"> {/* pb-20 para dar espacio en móvil si hay nav abajo */}
      
      {/* HEADER + BOTÓN ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Alumnos</h1>
          <p className="text-gray-500 text-sm">Listado general de socios</p>
        </div>
        
        <button 
          onClick={handleNewClient}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="font-medium">Nuevo Alumno</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar alumno..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
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