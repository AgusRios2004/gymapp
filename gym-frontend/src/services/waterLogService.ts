import api from '../lib/axios';
import type { WaterLog } from '../types/index';

export const getWaterLog = async (clientId: number, date?: string): Promise<WaterLog> => {
  const params = date ? { date } : {};
  const response = await api.get<WaterLog>(`/clients/${clientId}/water`, { params });
  return response.data;
};

export const addWaterLog = async (clientId: number, amountMl: number, date?: string): Promise<WaterLog> => {
  const params = { amountMl, ...(date ? { date } : {}) };
  const response = await api.post<WaterLog>(`/clients/${clientId}/water/add`, null, { params });
  return response.data;
};
