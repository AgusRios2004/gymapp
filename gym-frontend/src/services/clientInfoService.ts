import api from '../lib/axios';
import type { Assistance, Payment, Routine, ProductPurchased } from '../types/index';
import type { ApiResponse } from '../types/api.types';

const path = '/clients-info-controller';

export const getClientAssistance = async (clientId: number | string): Promise<Assistance[]> => {
    const response = await api.get<ApiResponse<Assistance[]>>(`${path}/${clientId}/assistance`);
    return response.data.data;
};

export const getClientPayments = async (clientId: number | string): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(`${path}/${clientId}/payments`);
    return response.data.data;
};

export const getClientRoutines = async (clientId: number | string): Promise<Routine[]> => {
    const response = await api.get<ApiResponse<Routine[]>>(`${path}/${clientId}/routines`);
    return response.data.data;
};

export const getClientProductsPurchased = async (clientId: number | string): Promise<ProductPurchased[]> => {
    const response = await api.get<ApiResponse<ProductPurchased[]>>(`${path}/${clientId}/products`);
    return response.data.data;
};
