import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useForm, useFieldArray, type Control, type UseFormRegister, type UseFormGetValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { X, Plus, Trash2, Dumbbell } from 'lucide-react';

import { RoutineSchema } from '../../types/schema.type';
import { updateRoutine, getRoutineById, deleteRoutine } from '../../services/routineService';
import { getExercises } from '../../services/exerciseService';
import type { Routine } from '../../types/index';
import type { z } from 'zod';
import Button from '../ui/Button';
import { Input } from '../ui/Input';

type RoutineFormData = z.infer<typeof RoutineSchema>;

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: Routine | null;
}

const EditRoutineModal: React.FC<EditRoutineModalProps> = ({ isOpen, onClose, routine }) => {
  const queryClient = useQueryClient();

  // 1. Obtener lista de ejercicios para el selector
  const { data: exercisesList = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: getExercises,
    enabled: isOpen, // Solo cargar cuando el modal se abre
  });

  // 1.5 Obtener la rutina completa (con ejercicios) por ID para asegurar que tenemos todos los detalles
  const { data: fullRoutine } = useQuery({
    queryKey: ['routine', routine?.id],
    queryFn: () => getRoutineById(routine!.id),
    enabled: isOpen && !!routine?.id,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RoutineFormData>({
    resolver: zodResolver(RoutineSchema) as any,
    defaultValues: {
      name: '',
      goal: '',
      active: true,
      days: [],
    },
  });

  // Array de Días
  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control,
    name: 'days',
  });

  // 2. Cargar datos al abrir
  useEffect(() => {
    // Usamos fullRoutine si está disponible, sino routine (aunque routine podría venir incompleto)
    const dataToLoad = fullRoutine || routine;

    // Debug: Abre la consola (F12) para ver si 'routineExercises' tiene datos y cómo se llaman sus campos
    console.log("EditRoutineModal - Datos cargados:", dataToLoad);

    if (isOpen && dataToLoad) {
      reset({
        id: dataToLoad.id,
        name: dataToLoad.name,
        goal: dataToLoad.goal,
        active: dataToLoad.active,
        // Mapeo seguro para evitar errores si routineExercises viene nulo o con otro nombre
        days: dataToLoad.days?.map((day) => ({
          id: day.id,
          dayOrder: day.dayOrder,
          routineExercises: (day.routineExercises || (day as any).exercises || []).map((ex: any) => {
            // 1. Intentamos obtener el ID explícito. Si no viene, buscamos por nombre en la lista cargada.
            let resolvedExerciseId = ex.exerciseId || ex.exercise?.id || ex.idExercise;

            if (!resolvedExerciseId && ex.exerciseName && exercisesList.length > 0) {
              const found = exercisesList.find((e: any) => e.name === ex.exerciseName);
              if (found) resolvedExerciseId = found.id;
            }

            return {
              id: ex.id,
              // 2. Usamos el ID encontrado, o fallamos a ex.id (mejor que nada)
              exerciseId: resolvedExerciseId || ex.id,
              sets: ex.sets,
              repetitions: ex.repetitions,
              weight: ex.weight
            };
          }),
        })) || [],
      });
    }
  }, [isOpen, fullRoutine, routine, reset, exercisesList]);

  // 3. Mutación para guardar
  const mutation = useMutation({
    mutationFn: (data: RoutineFormData) => {
      if (!routine?.id) throw new Error("ID de rutina no encontrado");
      
      const payload = {
        ...data,
        days: data.days?.map(day => ({
          id: day.id,
          dayOrder: day.dayOrder,
          exercises: (day.routineExercises || []).map(ex => ({
            idExercise: ex.exerciseId,
            sets: ex.sets,
            repetitions: ex.repetitions,
            weight: ex.weight
          }))
        }))
      };

      return updateRoutine(routine.id, payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rutina actualizada correctamente');
      onClose();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || 'Error al actualizar la rutina');
    },
  });

  const onSubmit = (data: RoutineFormData) => {
    mutation.mutate(data);
  };

  // 4. Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rutina eliminada correctamente');
      onClose();
    },
    onError: (error: any) => {
      console.error(error);
      // Mensaje amigable: si falla, probablemente es porque tiene datos vinculados
      toast.error('No se pudo eliminar. Si la rutina está asignada a alumnos, prueba desactivándola (Rutina Activa: No).');
    },
  });

  const handleDelete = () => {
    if (!routine?.id) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar esta rutina permanentemente?')) {
      deleteMutation.mutate(routine.id);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Editar Rutina</h3>
            <p className="text-gray-500 text-sm">Modifica la estructura y ejercicios</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Formulario Scrollable */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto space-y-8 flex-1">
            
            {/* Campos Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre"
                {...register('name')}
                error={errors.name?.message}
              />
              <Input
                label="Objetivo"
                {...register('goal')}
                error={errors.goal?.message}
              />
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="active"
                  {...register('active')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="active" className="text-gray-700 font-medium cursor-pointer">
                  Rutina Activa
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Sección de Días */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 p-1 rounded-lg"><Dumbbell size={18}/></span>
                  Días de Entrenamiento
                </h4>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => appendDay({ dayOrder: dayFields.length + 1, routineExercises: [] })}
                  className="gap-2"
                >
                  <Plus size={16} /> Agregar Día
                </Button>
              </div>

              <div className="space-y-6">
                {dayFields.map((day, index) => {
                  // Verificamos si existe un ID real (de base de datos) para este día
                  const dayId = getValues(`days.${index}.id`);
                  return (
                  <div key={day.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
                    {dayId && <input type="hidden" {...register(`days.${index}.id`, { valueAsNumber: true })} />}
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                        Día {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Subcomponente para ejercicios */}
                    <DayExercises 
                      nestIndex={index} 
                      control={control} 
                      register={register} 
                      exercisesList={exercisesList}
                      getValues={getValues}
                    />
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-3xl">
            {/* Botón Eliminar (Izquierda) */}
            <div>
              {routine?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} /> Eliminar Rutina
                </button>
              )}
            </div>

            {/* Botones de Acción (Derecha) */}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// Subcomponente para manejar la lista anidada de ejercicios
const DayExercises = ({ nestIndex, control, register, exercisesList, getValues }: { nestIndex: number, control: Control<any>, register: UseFormRegister<any>, exercisesList: any[], getValues: UseFormGetValues<RoutineFormData> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${nestIndex}.routineExercises`,
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 uppercase">Ejercicios</span>
        <button
          type="button"
          onClick={() => append({ exerciseId: '', sets: 3, repetitions: 10 })}
          className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
        >
          <Plus size={14} /> AGREGAR
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {fields.map((item, k) => {
          const exerciseId = getValues(`days.${nestIndex}.routineExercises.${k}.id`);
          return (
          <div key={item.id} className="p-3 flex flex-wrap gap-3 items-end">
            {exerciseId && <input type="hidden" {...register(`days.${nestIndex}.routineExercises.${k}.id`, { valueAsNumber: true })} />}
            <div className="flex-1 min-w-[180px]">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Ejercicio</label>
              <select
                {...register(`days.${nestIndex}.routineExercises.${k}.exerciseId`, { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                {exercisesList.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Series</label>
              <input type="number" {...register(`days.${nestIndex}.routineExercises.${k}.sets`, { valueAsNumber: true })} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center" />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Reps</label>
              <input type="number" {...register(`days.${nestIndex}.routineExercises.${k}.repetitions`, { valueAsNumber: true })} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center" />
            </div>
            <button type="button" onClick={() => remove(k)} className="mb-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
          </div>
          );
        })}
        {fields.length === 0 && <div className="p-4 text-center text-xs text-gray-400 italic">Sin ejercicios asignados</div>}
      </div>
    </div>
  );
};

export default EditRoutineModal;