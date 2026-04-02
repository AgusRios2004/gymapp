import api from '../lib/axios';
import type { Assistance } from '../types/index';
import type { ApiResponse } from '../types/api.types';

export interface AssistanceRequest {
    idClient: number;
    idProfessor: number;
    date: string;
    inputHour: string;
}

const path = '/assistance';

export const registerAssistance = async (data: AssistanceRequest): Promise<Assistance> => {
    const response = await api.post<ApiResponse<Assistance>>(path, data);
    return response.data.data;
};

export const getAssistanceByDate = async (date: string): Promise<Assistance[]> => {
    const response = await api.get<ApiResponse<Assistance[]>>(`${path}/date`, { params: { date } });
    return response.data.data;
};

export const getAssistanceByClient = async (clientId: number | string): Promise<Assistance[]> => {
    const response = await api.get<ApiResponse<Assistance[]>>(`${path}/client/${clientId}`);
    return response.data.data;
};
