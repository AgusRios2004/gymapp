import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getClients } from '../../clients/services/clientService';
import { registerAssistance, getAssistanceByDate } from '../services/assistanceService';
import type { Client, Assistance } from '../../../types';
import { AxiosError } from 'axios';
import type { ApiResponse } from '../../../types/api.types.ts';

export function useAttendance() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const clientsQuery = useQuery<Client[]>({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true)
  });

  const todayAssistanceQuery = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  const registerMutation = useMutation({
    mutationFn: registerAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistance', today] });
      toast.success("¡Ingreso registrado con éxito!", {
        position: "top-center"
      });
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
        const message = error.response?.data?.message || "Error al registrar asistencia";
        toast.error(message);
    }
  });

  return {
    clients: clientsQuery.data || [],
    isLoadingClients: clientsQuery.isLoading,
    todayAssistance: todayAssistanceQuery.data || [],
    isLoadingAssistance: todayAssistanceQuery.isLoading,
    registerAssistance: (data: { idClient: number; idProfessor: number; date: string; inputHour: string }, callback?: () => void) => {
      registerMutation.mutate(data, { onSuccess: callback });
    },
    isRegisteringAssistance: registerMutation.isPending
  };
}
