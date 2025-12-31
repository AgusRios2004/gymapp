import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { RoutineSchema } from '../../types/schema.type';
import type { RoutineDay, RoutineExercise } from '../../types/index';
import { createRoutine } from '../../services/routineService';
import { getExercises } from '../../services/exerciseService'; 

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
}
    
const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Cargar ejercicios para el select
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: getExercises,
    enabled: isOpen,
  });

  // Resetear formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setName('');
      setGoal('');
      setDays([]);
      setErrors([]);
    }
  }, [isOpen]);

  const addDay = () => {
    const newDayOrder = days.length + 1;
    setDays([...days, { dayOrder: newDayOrder, routineExercises: [] }]);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      dayOrder: i + 1 // Reordenar
    }));
    setDays(newDays);
  };

  const addExercise = (dayIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].routineExercises.push({
      exerciseId: undefined,
      sets: 3,
      repetitions: 10,
      weight: 0
    } as RoutineExercise);
    setDays(newDays);
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof RoutineExercise, value: any) => {
    const newDays = [...days];
    newDays[dayIndex].routineExercises[exIndex] = {
      ...newDays[dayIndex].routineExercises[exIndex],
      [field]: value
    };
    setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...days];
    newDays[dayIndex].routineExercises.splice(exIndex, 1);
    setDays(newDays);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      onClose();
    },
    onError: (error: any) => {
      setErrors([error.message || 'Error al crear la rutina']);
    }
  });

  const handleSubmit = () => {
    const formData = {
      name,
      goal,
      active: true,
      days // Zod validará routineExercises aquí
    };

    const result = RoutineSchema.safeParse(formData);

    if (!result.success) {
      setErrors(result.error.issues.map(i => i.message));
      return;
    }

    // Mapeo final para el Backend (RoutineRequestDTO espera 'exercises' con 'idExercise')
    const payload = {
      ...result.data,
      days: result.data.days?.map(day => ({
        dayOrder: day.dayOrder,
        exercises: day.routineExercises?.map(ex => ({
          idExercise: ex.exerciseId, // Mapeo clave: exerciseId -> idExercise
          sets: ex.sets,
          repetitions: ex.repetitions,
          weight: ex.weight
        })) || []
      }))
    };

    mutate(payload as any); // Cast necesario si tus tipos de servicio difieren ligeramente
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-2xl font-bold text-gray-900">Nueva Rutina</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Datos Generales */}
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Nombre de la Rutina"
              placeholder="Ej: Hipertrofia 4 días"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextArea
              label="Objetivo / Descripción"
              placeholder="Describe el objetivo principal..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          {/* Días y Ejercicios */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-800">Estructura Semanal</h4>
              <Button variant="secondary" onClick={addDay} size="sm">+ Agregar Día</Button>
            </div>

            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    Día {day.dayOrder}
                  </span>
                  <button onClick={() => removeDay(dayIndex)} className="text-red-500 text-sm hover:underline">
                    Eliminar Día
                  </button>
                </div>

                <div className="space-y-3">
                  {day.routineExercises.map((ex, exIndex) => (
                    <div key={exIndex} className="flex gap-3 items-end bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Ejercicio</label>
                        <select
                          className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={ex.exerciseId || ''}
                          onChange={(e) => updateExercise(dayIndex, exIndex, 'exerciseId', Number(e.target.value))}
                        >
                          <option value="">Seleccionar...</option>
                          {exercises.map((e: any) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <Input label="Series" type="number" value={ex.sets} 
                          onChange={(e) => updateExercise(dayIndex, exIndex, 'sets', Number(e.target.value))} />
                      </div>
                      <div className="w-20">
                        <Input label="Reps" type="number" value={ex.repetitions} 
                          onChange={(e) => updateExercise(dayIndex, exIndex, 'repetitions', Number(e.target.value))} />
                      </div>
                      <button 
                        onClick={() => removeExercise(dayIndex, exIndex)}
                        className="mb-2 text-gray-400 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => addExercise(dayIndex)} className="w-full border-dashed border-2">
                    + Agregar Ejercicio
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm space-y-1">
              {errors.map((err, idx) => <p key={idx}>• {err}</p>)}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Crear Rutina'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateRoutineModal;
