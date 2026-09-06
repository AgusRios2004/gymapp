import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getRoutines, deleteRoutine } from '../services/routineService';
import { getExercises, createExercise, type ExerciseFormData } from '../services/exerciseService';

export function useRoutines() {
  const queryClient = useQueryClient();

  const routinesQuery = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rutina eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar la rutina');
    }
  });

  return {
    routines: routinesQuery.data || [],
    isLoadingRoutines: routinesQuery.isLoading,
    isErrorRoutines: routinesQuery.isError,
    deleteRoutine: (id: number, callback?: () => void) => {
      deleteMutation.mutate(id, { onSuccess: callback });
    },
    isDeletingRoutine: deleteMutation.isPending
  };
}

export function useExercises() {
  const queryClient = useQueryClient();

  const exercisesQuery = useQuery({
    queryKey: ['exercises'],
    queryFn: getExercises
  });

  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success("✅ Ejercicio creado correctamente");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al crear el ejercicio");
    }
  });

  return {
    exercises: exercisesQuery.data || [],
    isLoadingExercises: exercisesQuery.isLoading,
    isErrorExercises: exercisesQuery.isError,
    createExercise: (data: ExerciseFormData, callback?: () => void) => {
      createExerciseMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingExercise: createExerciseMutation.isPending
  };
}
