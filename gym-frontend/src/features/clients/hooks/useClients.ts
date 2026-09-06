import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getClients, createClient, updateClient, assignRoutine } from '../services/clientService';
import { registerAssistance, getAssistanceByDate } from '../../attendance/services/assistanceService';
import { useAuth } from '../../auth/context/AuthContext';
import type { Assistance } from '../../../types';
import { z } from 'zod';
import { ClientSchema, AssignRoutineSchema } from '../../../types/schema.type.ts';

type ClientFormData = z.infer<typeof ClientSchema>;
type AssignRoutineFormData = z.infer<typeof AssignRoutineSchema>;

export function useClients(filterStatus: 'all' | 'active' | 'inactive' | 'debtors') {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const assistanceTodayQuery = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  const clientsQuery = useQuery({
    queryKey: ['clients', filterStatus],
    queryFn: async () => {
      const activeParam = filterStatus === 'all' ? undefined : (filterStatus === 'inactive' ? false : (filterStatus === 'active' ? true : undefined));
      const debtorsParam = filterStatus === 'debtors';
      const data = await getClients(activeParam, debtorsParam);
      return Array.isArray(data) ? data : [];
    }
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
    onError: (error: any, _, context) => {
      if (context?.previousAssistance) {
        queryClient.setQueryData(['assistance', today], context.previousAssistance);
      }
      const message = error.response?.data?.message || "Error al registrar asistencia";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("✅ Asistencia registrada");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assistance', today] });
    }
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Alumno registrado correctamente");
    },
    onError: (error) => {
      console.error("Error al crear el cliente:", error);
      toast.error("Error al crear el cliente");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: ClientFormData }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Datos actualizados");
    },
    onError: (error) => {
      console.error("Error al actualizar el cliente:", error);
      toast.error("Error al actualizar el cliente");
    }
  });

  const assignRoutineMutation = useMutation({
    mutationFn: assignRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Rutina asignada correctamente");
    },
    onError: (error) => {
      console.error("Error al asignar rutina:", error);
      toast.error("Error al asignar la rutina");
    }
  });

  return {
    assistanceToday: assistanceTodayQuery.data || [],
    isLoadingAssistance: assistanceTodayQuery.isLoading,
    clients: clientsQuery.data || [],
    isLoadingClients: clientsQuery.isLoading,
    isErrorClients: clientsQuery.isError,
    markAttendance: (clientId: number) => assistanceMutation.mutate(clientId),
    isMarkingAttendance: assistanceMutation.isPending,
    createClient: (data: ClientFormData, callback: () => void) => {
      createMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingClient: createMutation.isPending,
    updateClient: (id: number, data: ClientFormData, callback: () => void) => {
      updateMutation.mutate({ id, data }, { onSuccess: callback });
    },
    isUpdatingClient: updateMutation.isPending,
    assignRoutine: (data: AssignRoutineFormData, callback: () => void) => {
      assignRoutineMutation.mutate(data, { onSuccess: callback });
    },
    isAssigningRoutine: assignRoutineMutation.isPending
  };
}
