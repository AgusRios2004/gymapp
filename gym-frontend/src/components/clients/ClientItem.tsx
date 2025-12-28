import { User, Phone, MoreVertical } from 'lucide-react';
import type  {Client } from '../../types/index';
import { Badge } from '../ui/Badge';

interface ClientItemProps {
  client: Client;
  onEdit?: () => void;
}

export const ClientItem = ({ client, onEdit }: ClientItemProps) => {
  return (
    <div className="group bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-200">

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        
        {/* 1. INFO PRINCIPAL (Avatar + Nombre) */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{client.name} {client.lastName}</h3>
            <p className="text-sm text-gray-500">{client.dni}</p>
          </div>
        </div>

        {/* 2. DATOS SECUNDARIOS (Se ocultan o reacomodan en móvil) */}
        
        {/* Estado: En móvil aparece debajo del nombre */}
        <div className="flex md:w-32 md:justify-center">
           <Badge variant={client.active ? 'success' : 'danger'}>
             {client.active ? 'Activo' : 'Inactivo'}
           </Badge>
        </div>

        {/* Info Extra: Telefono y Vencimiento */}
        <div className="flex items-center gap-4 text-sm text-gray-500 md:w-64 justify-between md:justify-start">
           <div className="flex items-center gap-1">
              <Phone size={14} className="md:hidden" />
              <span>{client.phone || 'Sin tel.'}</span>
           </div>
           <div className="md:hidden text-gray-300">|</div>
           <div>
              <span className="md:hidden font-medium text-gray-700">Vence: </span>
              <span>--/--</span>
           </div>
        </div>

        {/* 3. ACCIONES (Botón de menú) */}
        <div className="flex justify-end md:w-10">
          <button 
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors active:scale-90"
          >
            <MoreVertical size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};