import api from '../lib/axios';
import type { Client } from '../types/index';
import type { ApiResponse } from '../types/api.types'; // Asegúrate de importar esto
import { ClientSchema } from '../types/schema.type';
import { z } from 'zod';

type ClientFormData = z.infer<typeof ClientSchema>;

const path = '/clients';

export const getClients = async (): Promise<Client[]> => {
    // api.get ya usa la baseURL, así que solo ponemos la ruta relativa
    // El backend devuelve ApiResponse<Client[]>, no Client[] directo
    const response = await api.get<ApiResponse<Client[]>>(path);
    // Retornamos response.data.data porque:
    // 1er .data es de Axios
    // 2do .data es de tu WebApiResponse ({ success: true, data: [...] })
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
