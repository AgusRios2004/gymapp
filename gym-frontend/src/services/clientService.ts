import api from '../lib/axios';
import type { Client, PageResponse } from '../types/index';
import type { ApiResponse } from '../types/api.types';
import { ClientSchema, AssignRoutineSchema } from '../types/schema.type';
import { z } from 'zod';

type ClientFormData = z.infer<typeof ClientSchema>;
type AssignRoutineFormData = z.infer<typeof AssignRoutineSchema>;

const path = '/clients';

export const getClients = async (
    page = 0,
    size = 10,
    search = '',
    active?: boolean,
    debtors?: boolean
): Promise<PageResponse<Client>> => {
    const params: Record<string, string | number | boolean | undefined> = { page, size };
    if (search) params.search = search;
    if (active !== undefined) params.active = active;
    if (debtors !== undefined) params.debtors = debtors;
    
    const response = await api.get<ApiResponse<PageResponse<Client>>>(path, { params });
    return response.data.data;
};

export const getAllClientsList = async (active?: boolean, debtors?: boolean): Promise<Client[]> => {
    const params: Record<string, string | number | boolean | undefined> = { page: 0, size: 1000 };
    if (active !== undefined) params.active = active;
    if (debtors !== undefined) params.debtors = debtors;
    
    const response = await api.get<ApiResponse<PageResponse<Client>>>(path, { params });
    return response.data.data.content || [];
};

export const getClientById = async (id: number | string): Promise<Client> => {
    const response = await api.get<ApiResponse<Client>>(`${path}/${id}`);
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

export const setClientStatus = async (id: number, active: boolean): Promise<Client> => {
    const response = await api.patch<ApiResponse<Client>>(`${path}/${id}/status`, { active });
    return response.data.data;
};
