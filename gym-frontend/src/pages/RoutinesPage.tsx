import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import CreateRoutineModal from '../components/routines/CreateRoutineModal';
import RoutineDetailsModal from '../components/routines/RoutineDetailsModal';
import { getRoutines, deleteRoutine } from '../services/routineService';
import type { Routine } from '../types/index';

const RoutinesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToView, setRoutineToView] = useState<Routine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener rutinas desde el backend
  const { data: routines = [], isLoading, isError } = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines,
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rutina eliminada correctamente');
      setRoutineToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar la rutina');
    }
  });

  // Filtrar rutinas por nombre (buscador)
  const filteredRoutines = routines.filter((routine: Routine) =>
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rutinas</h1>
          <p className="text-gray-500 mt-1">Gestiona las plantillas de entrenamiento</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-lg shadow-blue-500/30"
        >
          + Nueva Rutina
        </Button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <Input
          label="Buscar Rutina"
          placeholder="Escribe el nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Rutinas */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-red-50 rounded-3xl">
          <p className="text-red-600 font-medium">Error al cargar las rutinas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoutines.map((routine: Routine) => (
            <div 
              key={routine.id} 
              className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-blue-100 transition-colors">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setRoutineToView(routine); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Ver detalles"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setRoutineToDelete(routine); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Eliminar rutina"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  routine.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {routine.active ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{routine.name}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {routine.goal}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50 pt-4">
                <span>📅 {routine.days?.length || 0} Días</span>
                <span>•</span>
                <span>{routine.isTemplate ? 'Plantilla' : 'Personalizada'}</span>
              </div>
            </div>
          ))}
          
          {filteredRoutines.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium mb-2">No se encontraron rutinas</p>
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)} size="sm">
                Crear la primera
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateRoutineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <RoutineDetailsModal
        isOpen={!!routineToView}
        onClose={() => setRoutineToView(null)}
        routine={routineToView}
      />

      {/* Modal de Confirmación de Eliminación */}
      {routineToDelete && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-100 p-4 rounded-full text-red-600">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">¿Eliminar Rutina?</h3>
              <p className="text-gray-500">
                Estás a punto de eliminar <strong>"{routineToDelete.name}"</strong>. 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3 w-full mt-4">
                <Button variant="ghost" onClick={() => setRoutineToDelete(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => deleteMutation.mutate(routineToDelete.id)} 
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : 'Sí, Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RoutinesPage;
