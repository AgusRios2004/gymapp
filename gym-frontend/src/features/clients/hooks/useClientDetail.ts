import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getClientById } from '../services/clientService';
import { 
  getClientAssistance, 
  getClientPayments, 
  getClientRoutines, 
  getClientProductsPurchased 
} from '../services/clientInfoService';
import { getPhysicalRecords, createPhysicalRecord, deletePhysicalRecord } from '../services/physicalRecordService';
import type { PhysicalRecord } from '../../../types';

export function useClientDetail(clientId: number) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientById(clientId),
    enabled: !!clientId
  });
}

export function useClientAssistance(clientId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['client-assistance', clientId],
    queryFn: () => getClientAssistance(clientId),
    enabled: enabled && !!clientId
  });
}

export function useClientPayments(clientId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['client-payments', clientId],
    queryFn: () => getClientPayments(clientId),
    enabled: enabled && !!clientId
  });
}

export function useClientRoutines(clientId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['client-routines', clientId],
    queryFn: () => getClientRoutines(clientId),
    enabled: enabled && !!clientId
  });
}

export function useClientProducts(clientId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['client-products', clientId],
    queryFn: () => getClientProductsPurchased(clientId),
    enabled: enabled && !!clientId
  });
}

export function useClientPhysicalRecords(clientId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['client-physical', clientId],
    queryFn: () => getPhysicalRecords(clientId),
    enabled: enabled && !!clientId
  });
}

export function useCreatePhysicalRecord(clientId: number, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<PhysicalRecord>) => createPhysicalRecord(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-physical', clientId] });
      toast.success("📈 Progreso registrado");
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: () => {
      toast.error("❌ Error al guardar registro");
    }
  });
}

export function useDeletePhysicalRecord(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePhysicalRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-physical', clientId] });
      toast.success("🗑️ Registro eliminado");
    },
    onError: () => {
      toast.error("❌ Error al eliminar registro");
    }
  });
}
