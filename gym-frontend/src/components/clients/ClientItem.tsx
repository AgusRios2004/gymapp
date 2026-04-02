import { Edit, Dumbbell, Eye } from 'lucide-react'; 
import type { Client } from '../../types/index';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface ClientItemProps {
  client: Client;
  onEdit: () => void;
  onAssignRoutine: () => void;
}

export const ClientItem: React.FC<ClientItemProps> = ({ client, onEdit, onAssignRoutine }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Información del Cliente */}
      <div 
        className="flex-1 cursor-pointer hover:opacity-80 group"
        onClick={() => navigate(`/clients/${client.id}`)}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
            {client.name} {client.lastName}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${client.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {client.active ? 'Activo' : 'Inactivo'}
          </span>
          {client.isDebtor && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-700">
              Deuda
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span className="font-medium">DNI:</span> {client.dni}
          <span className="text-gray-300">|</span>
          <span className="font-medium">Tel:</span> {client.phone}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <Button 
          onClick={() => navigate(`/clients/${client.id}`)} 
          variant="ghost" 
          className="flex-1 sm:flex-none text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100"
        >
          <Eye size={18} className="mr-2" />
          Ver Ficha
        </Button>

        <Button 
          onClick={onAssignRoutine} 
          variant="ghost" 
          className="flex-1 sm:flex-none text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100"
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

