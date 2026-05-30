import { Edit, Dumbbell, Eye, UserCheck } from 'lucide-react'; 
import type { Client } from '../../types/index';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface ClientItemProps {
  client: Client;
  onEdit: () => void;
  onAssignRoutine: () => void;
  onMarkAttendance: () => void;
  isMarkedToday?: boolean;
}

export const ClientItem: React.FC<ClientItemProps> = ({ 
  client, 
  onEdit, 
  onAssignRoutine,
  onMarkAttendance,
  isMarkedToday,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Información del Cliente */}
      <div 
        className="flex-1 cursor-pointer hover:opacity-80 group"
        onClick={() => navigate(`/clients/${client.id}`)}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors">
            {client.name} {client.lastName}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${client.active ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
            {client.active ? 'Activo' : 'Inactivo'}
          </span>
          {client.isDebtor && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              Deuda
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span className="font-medium">DNI:</span> {client.dni}
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="font-medium">Tel:</span> {client.phone}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
        <Button 
          onClick={onMarkAttendance}
          disabled={isMarkedToday}
          variant="ghost" 
          className={`w-full px-1 sm:px-4 text-[11px] sm:text-sm flex-col sm:flex-row h-auto py-2 sm:py-3 ${
            isMarkedToday
              ? 'text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 cursor-default opacity-85'
              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900/50'
          }`}
        >
          <UserCheck size={16} className="sm:mr-2 mb-1 sm:mb-0" />
          {isMarkedToday ? 'Asistió' : 'Asistencia'}
        </Button>

        <Button 
          onClick={() => navigate(`/clients/${client.id}`)} 
          variant="ghost" 
          className="w-full text-blue-600 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 px-1 sm:px-4 text-[11px] sm:text-sm flex-col sm:flex-row h-auto py-2 sm:py-3"
        >
          <Eye size={16} className="sm:mr-2 mb-1 sm:mb-0" />
          Ficha
        </Button>

        <Button 
          onClick={onAssignRoutine} 
          variant="ghost" 
          className="w-full text-purple-600 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-100 dark:border-purple-900/50 px-1 sm:px-4 text-[11px] sm:text-sm flex-col sm:flex-row h-auto py-2 sm:py-3"
        >
          <Dumbbell size={16} className="sm:mr-2 mb-1 sm:mb-0" />
          Rutina
        </Button>
        
        <Button 
          onClick={onEdit} 
          variant="secondary"
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-gray-700 dark:text-gray-200 px-1 sm:px-4 text-[11px] sm:text-sm flex-col sm:flex-row h-auto py-2 sm:py-3 border-none"
        >
          <Edit size={16} className="sm:mr-2 mb-1 sm:mb-0" />
          Editar
        </Button>
      </div>
    </div>
  );
};

