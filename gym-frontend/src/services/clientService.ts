import api from '../lib/axios';
import type { Client } from '../types/index';
import { ClientSchema } from '../types/schema.type';
import { z } from 'zod';

type ClientFormData = z.infer<typeof ClientSchema>;

const path = '/clients';

export const getClients = async (): Promise<Client[]> => {
    // api.get ya usa la baseURL, así que solo ponemos la ruta relativa
    const response = await api.get<Client[]>(path);
    return response.data;
};

export const createClient = async (clientData: ClientFormData): Promise<Client> => {
    const response = await api.post<Client>(path, clientData);
    return response.data;
};

export const updateClient = async (id: number | string, clientData: ClientFormData): Promise<Client> => {
    const response = await api.put<Client>(`${path}/${id}`, clientData);
    return response.data;
};

export const getClientPayments = async (clientId: number | string) => {
    // Aquí podrías tipar el retorno si tienes una interfaz Payment
    const response = await api.get(`${path}/${clientId}/payments`);
    return response.data;
};
