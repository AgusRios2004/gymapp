import api from '../lib/axios';
import type { SupplementLog } from '../types/index';

export const getSupplementLog = async (clientId: number, date?: string): Promise<SupplementLog> => {
  const params = date ? { date } : {};
  const response = await api.get<SupplementLog>(`/clients/${clientId}/supplements`, { params });
  return response.data;
};

export const saveSupplementLog = async (clientId: number, log: Partial<SupplementLog>): Promise<SupplementLog> => {
  const response = await api.post<SupplementLog>(`/clients/${clientId}/supplements`, log);
  return response.data;
};
