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
    <div className="bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 p-5 rounded-2xl shadow-industrial transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
      {/* Información del Cliente */}
      <div 
        className="flex-1 cursor-pointer hover:opacity-90"
        onClick={() => navigate(`/clients/${client.id}`)}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors font-display tracking-tight">
            {client.name} {client.lastName}
          </h3>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
            client.active 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {client.active ? 'Activo' : 'Inactivo'}
          </span>
          {client.isDebtor && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Deuda
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 flex items-center gap-2 font-medium">
          <span>DNI: <strong className="text-zinc-200">{client.dni}</strong></span>
          <span className="text-zinc-700">•</span>
          <span>Tel: <strong className="text-zinc-200">{client.phone || '-'}</strong></span>
        </p>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
        <Button 
          onClick={() => navigate(`/clients/${client.id}`)} 
          variant="outline" 
          size="sm"
          className="flex-1 sm:flex-initial text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
        >
          <Eye size={14} className="mr-1.5" />
          Ver Ficha
        </Button>

        <Button 
          onClick={onAssignRoutine} 
          variant="secondary" 
          size="sm"
          className="flex-1 sm:flex-initial bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
        >
          <Dumbbell size={14} className="mr-1.5 text-orange-400" />
          Rutina
        </Button>
        
        <Button 
          onClick={onEdit} 
          variant="ghost"
          size="sm"
          className="flex-1 sm:flex-initial text-zinc-400 hover:text-white hover:bg-zinc-800/60"
        >
          <Edit size={14} className="mr-1.5" />
          Editar
        </Button>
      </div>
    </div>
  );
};


