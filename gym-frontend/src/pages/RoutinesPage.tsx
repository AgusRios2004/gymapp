import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, Pencil, ClipboardList, CalendarDays } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ConfirmModal from '../components/ui/ConfirmModal';
import CreateRoutineModal from '../components/routines/CreateRoutineModal';
import RoutineDetailsModal from '../components/routines/RoutineDetailsModal';
import EditRoutineModal from '../components/routines/EditRoutineModal';
import { getRoutines, deleteRoutine } from '../services/routineService';
import type { Routine } from '../types/index';

const RoutinesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [routineToView, setRoutineToView] = useState<Routine | null>(null);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
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
    onError: (error: Error) => {
      toast.error(error.message || 'Error al obtener rutinas');
    }
  });

  // Filtrar rutinas por nombre (buscador)
  const filteredRoutines = routines.filter((routine: Routine) =>
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rutinas</h1>
          <p className="text-gray-500 mt-1">Gestiona las plantillas de entrenamiento</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Nueva Rutina
        </Button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
        <Input
          label="Buscar Rutina"
          placeholder="Escribe el nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Rutinas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-56 w-full" shape="card" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          variant="error"
          title="No pudimos cargar las rutinas"
          description="Volvé a intentarlo en unos segundos."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRoutines.map((routine: Routine) => (
            <div
              key={routine.id}
              className="group bg-white p-5 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600">
                  <ClipboardList size={22} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRoutineToView(routine); }}
                    className="min-h-11 min-w-11 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Ver detalles"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRoutineToEdit(routine); }}
                    className="min-h-11 min-w-11 flex items-center justify-center text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                    title="Editar rutina"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRoutineToDelete(routine); }}
                    className="min-h-11 min-w-11 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Eliminar rutina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <Badge variant={routine.active ? 'success' : 'neutral'} size="sm" className="w-fit mb-2">
                {routine.active ? 'Activa' : 'Inactiva'}
              </Badge>

              <h3 className="text-lg font-black text-slate-900 mb-1">{routine.name}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                {routine.goal}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-3 mt-auto">
                <CalendarDays size={13} />
                <span>{routine.days?.length || 0} días</span>
                <span>·</span>
                <span>{routine.isTemplate ? 'Plantilla' : 'Personalizada'}</span>
              </div>
            </div>
          ))}

          {filteredRoutines.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={<ClipboardList size={24} />}
                title="No se encontraron rutinas"
                description={searchTerm ? 'Probá con otro nombre.' : 'Creá la primera para empezar a asignarla a tus alumnos.'}
                action={
                  <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)} size="sm">
                    Crear la primera
                  </Button>
                }
              />
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

      <EditRoutineModal
        isOpen={!!routineToEdit}
        onClose={() => setRoutineToEdit(null)}
        routine={routineToEdit}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={!!routineToDelete}
        onClose={() => setRoutineToDelete(null)}
        onConfirm={() => routineToDelete && deleteMutation.mutate(routineToDelete.id)}
        variant="danger"
        title="¿Eliminar Rutina?"
        description={`Estás a punto de eliminar "${routineToDelete?.name}". Esta acción no se puede deshacer.`}
        confirmText={deleteMutation.isPending ? 'Eliminando...' : 'Sí, Eliminar'}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default RoutinesPage;
