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
    <div className="bg-white border border-slate-200/80 hover:border-slate-300 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
      {/* Información del Cliente */}
      <div 
        className="flex-1 cursor-pointer hover:opacity-90"
        onClick={() => navigate(`/clients/${client.id}`)}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors font-display tracking-tight">
            {client.name} {client.lastName}
          </h3>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
            client.active 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
              : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}>
            {client.active ? 'Activo' : 'Inactivo'}
          </span>
          {client.isDebtor && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              Deuda
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-2 font-medium">
          <span>DNI: <strong className="text-slate-700">{client.dni}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Tel: <strong className="text-slate-700">{client.phone || '-'}</strong></span>
        </p>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <Button 
          onClick={() => navigate(`/clients/${client.id}`)} 
          variant="outline" 
          size="sm"
          className="flex-1 sm:flex-initial text-emerald-700 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/90 px-5 font-extrabold"
        >
          <Eye size={14} className="mr-1.5" />
          Ver Ficha
        </Button>

        <Button 
          onClick={onAssignRoutine} 
          variant="secondary" 
          size="sm"
          className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 px-5 font-bold"
        >
          <Dumbbell size={14} className="mr-1.5 text-emerald-600" />
          Rutina
        </Button>
        
        <Button 
          onClick={onEdit} 
          variant="ghost"
          size="sm"
          className="flex-1 sm:flex-initial text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-4 font-bold"
        >
          <Edit size={14} className="mr-1.5" />
          Editar
        </Button>
      </div>
    </div>
  );
};


