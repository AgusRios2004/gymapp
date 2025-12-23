import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Client } from '../types/index';
import { ClientItem } from '../components/clients/ClientItem';

// MOCK DATA (Igual que antes)
const MOCK_CLIENTES: Client[] = [
  { id: 1, name: 'Juan', lastName: 'Pérez', dni: '12.345.678', phone: '261-555-001', email: 'juan@test.com', active: true },
  { id: 2, name: 'Maria', lastName: 'Gomez', dni: '23.456.789', phone: '261-555-002', email: 'maria@test.com', active: false },
  { id: 3, name: 'Carlos', lastName: 'Lopez', dni: '34.567.890', phone: '261-555-003', email: 'carlos@gym.com', active: true },
  { id: 4, name: 'Ana', lastName: 'Torres', dni: '45.678.901', phone: '261-555-004', email: 'ana@gym.com', active: true },
];

export default function ClientesPage() {
  const [clientes] = useState<Client[]>(MOCK_CLIENTES);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20"> {/* pb-20 para dar espacio en móvil si hay nav abajo */}
      
      {/* HEADER + BOTÓN ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Alumnos</h1>
          <p className="text-gray-500 text-sm">Listado general de socios</p>
        </div>
        
        {/* Botón flotante en móvil? Podría ser, por ahora botón normal */}
        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
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
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* LISTA DE ALUMNOS (GRID) */}
      <div className="grid gap-3">
        {clientes.map((cliente) => (
          <ClientItem key={cliente.id} client={cliente} />
        ))}
      </div>

    </div>
  );
}