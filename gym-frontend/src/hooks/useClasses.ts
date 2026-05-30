import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfessors } from '../services/professorService';
import { getClasses, createClass, deleteClass, updateClass, unassignClass, assignClass } from '../services/classService';
import { getRoutines } from '../services/routineService';
import { getClients, createClient } from '../services/clientService';
import { registerAssistance, getAssistanceByDate } from '../services/assistanceService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import type { GroupClass, Client, Assistance } from '../types';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '../types/api.types';

export function useClasses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Queries
  const classesQuery = useQuery<GroupClass[]>({
    queryKey: ['classes'],
    queryFn: async () => {
       const data = await getClasses();
       return Array.isArray(data) ? data : [];
    }
  });

  const routinesQuery = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines
  });

  const professorsQuery = useQuery({
    queryKey: ['professors', 'active'],
    queryFn: () => getProfessors(true)
  });

  const clientsQuery = useQuery<Client[]>({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true)
  });

  const assistanceQuery = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success("📅 Clase creada");
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const message = error.response?.data?.message || "No se pudo crear la clase";
      toast.error(`❌ ${message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success("🗑️ Clase eliminada");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, form: any }) => updateClass(data.id, data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success("📝 Clase actualizada");
    },
    onError: () => toast.error("❌ Error al actualizar la clase")
  });

  const assignMutation = useMutation({
    mutationFn: (data: { clientId: number, classId: number }) => assignClass(data.clientId, data.classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Alumno inscrito correctamente");
    },
    onError: () => toast.error("❌ Error al inscribir alumno")
  });

  const unassignMutation = useMutation({
    mutationFn: (clientId: number) => unassignClass(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      // Invalidate queries dynamic for classes is safer
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("👤 Alumno quitado de la clase");
    },
    onError: () => toast.error("❌ Error al quitar alumno")
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
        const { activeClassId, ...clientData } = data;
        const newClient = await createClient({...clientData, active: true});
        if (activeClassId) {
            await assignClass(newClient.id, Number(activeClassId));
        }
        return newClient;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['classes'] });
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success("👤 Alumno creado e inscrito");
    },
    onError: () => toast.error("❌ Error al crear alumno")
  });

  const assistanceMutation = useMutation({
    mutationFn: (clientId: number) => {
        const now = new Date();
        const inputHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return registerAssistance({
            idClient: clientId,
            idProfessor: user?.id || 0,
            date: today,
            inputHour: inputHour
        });
    },
    onMutate: async (clientId: number) => {
        await queryClient.cancelQueries({ queryKey: ['assistance', today] });
        const previousAssistance = queryClient.getQueryData<Assistance[]>(['assistance', today]) || [];
        const mockAssistance: Assistance = {
            idClient: clientId,
            clientName: '',
            idProfessor: user?.id || 0,
            professorName: '',
            date: today,
            inputHour: '00:00'
        };
        queryClient.setQueryData(['assistance', today], [...previousAssistance, mockAssistance]);
        return { previousAssistance };
    },
    onError: (error: AxiosError<ApiResponse<unknown>>, _, context) => {
        if (context?.previousAssistance) {
            queryClient.setQueryData(['assistance', today], context.previousAssistance);
        }
        const message = (error.response?.data?.message as string) || "Error al registrar asistencia";
        toast.error(message);
    },
    onSuccess: () => {
        toast.success("✅ Asistencia registrada");
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['assistance', today] });
    }
  });

  return {
    classes: classesQuery.data || [],
    routines: routinesQuery.data || [],
    professors: professorsQuery.data || [],
    clients: clientsQuery.data || [],
    assistanceToday: assistanceQuery.data || [],
    isLoadingClasses: classesQuery.isLoading,
    createClass: createMutation.mutateAsync,
    isCreatingClass: createMutation.isPending,
    deleteClass: deleteMutation.mutateAsync,
    isDeletingClass: deleteMutation.isPending,
    updateClass: updateMutation.mutateAsync,
    isUpdatingClass: updateMutation.isPending,
    assignStudent: assignMutation.mutateAsync,
    isAssigningStudent: assignMutation.isPending,
    unassignStudent: unassignMutation.mutateAsync,
    isUnassigningStudent: unassignMutation.isPending,
    quickAddStudent: createClientMutation.mutateAsync,
    isQuickAddingStudent: createClientMutation.isPending,
    registerStudentAssistance: assistanceMutation.mutateAsync,
    isRegisteringAssistance: assistanceMutation.isPending,
    today,
  };
}
