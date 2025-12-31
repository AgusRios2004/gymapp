import api from '../lib/axios';
import type { Client } from '../types/index';
import type { ApiResponse } from '../types/api.types'; // Asegúrate de importar esto
import { ClientSchema, AssignRoutineSchema } from '../types/schema.type';
import { z } from 'zod';

type ClientFormData = z.infer<typeof ClientSchema>;
type AssignRoutineFormData = z.infer<typeof AssignRoutineSchema>;

const path = '/clients';

export const getClients = async (active?: boolean): Promise<Client[]> => {
    const params = active !== undefined ? { active } : {};
    const response = await api.get<ApiResponse<Client[]>>(path, { params });
    return response.data.data;
};

export const createClient = async (clientData: ClientFormData): Promise<Client> => {
    const response = await api.post<ApiResponse<Client>>(path, clientData);
    return response.data.data;
};

export const updateClient = async (id: number | string, clientData: ClientFormData): Promise<Client> => {
    const response = await api.put<ApiResponse<Client>>(`${path}/${id}`, clientData);
    return response.data.data;
};

export const getClientPayments = async (clientId: number | string) => {
    // Aquí podrías tipar el retorno si tienes una interfaz Payment
    const response = await api.get(`${path}/${clientId}/payments`);
    return response.data;
};

export const assignRoutine = async (data: AssignRoutineFormData): Promise<void> => {
    // Ajusta la URL si tu backend usa otra ruta, ej: `${path}/assign-routine`
    await api.post(`${path}/assign-routine`, data);
};
