import { Edit, Dumbbell } from 'lucide-react'; 
import type { Client } from '../../types/index';
import Button from '../ui/Button';

interface ClientItemProps {
  client: Client;
  onEdit: () => void;
  onAssignRoutine: () => void;
}

export const ClientItem: React.FC<ClientItemProps> = ({ client, onEdit, onAssignRoutine }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Información del Cliente */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-lg">{client.name} {client.lastName}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${client.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {client.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span className="font-medium">DNI:</span> {client.dni}
          <span className="text-gray-300">|</span>
          <span className="font-medium">Tel:</span> {client.phone}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <Button 
          onClick={onAssignRoutine} 
          variant="ghost" 
          className="flex-1 sm:flex-none text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100"
        >
          <Dumbbell size={18} className="mr-2" />
          Rutina
        </Button>
        
        <Button 
          onClick={onEdit} 
          variant="secondary"
          className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <Edit size={18} className="mr-2" />
          Editar
        </Button>
      </div>
    </div>
  );
};
