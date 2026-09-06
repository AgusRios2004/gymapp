import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getProfessors, deleteProfessor, createProfessor } from '../services/professorService';
import type { Professor } from '../../../types';

export function useStaff() {
  const queryClient = useQueryClient();

  const professorsQuery = useQuery({
    queryKey: ['professors'],
    queryFn: () => getProfessors()
  });

  const createProfessorMutation = useMutation({
    mutationFn: (data: Partial<Professor>) => createProfessor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] });
      toast.success("✅ Profesor creado correctamente");
    },
    onError: () => toast.error("❌ Error al crear profesor")
  });

  const toggleProfessorMutation = useMutation({
    mutationFn: (id: number) => deleteProfessor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] });
      toast.success("✅ Estado del profesor actualizado");
    },
    onError: () => toast.error("❌ Error al modificar profesor")
  });

  return {
    professors: professorsQuery.data || [],
    isLoadingProfessors: professorsQuery.isLoading,
    createProfessor: (data: Partial<Professor>, callback: () => void) => {
      createProfessorMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingProfessor: createProfessorMutation.isPending,
    toggleProfessor: (id: number) => {
      toggleProfessorMutation.mutate(id);
    },
    isTogglingProfessor: toggleProfessorMutation.isPending
  };
}
