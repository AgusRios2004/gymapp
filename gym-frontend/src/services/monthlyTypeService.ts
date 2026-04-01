import api from '../lib/axios';
import type { MonthlyType } from '../types/index';
import type { ApiResponse } from '../types/api.types';

const path = '/monthly-type';

export const getMonthlyTypes = async (): Promise<MonthlyType[]> => {
    const response = await api.get<ApiResponse<MonthlyType[]>>(path);
    return response.data.data;
};

export const createMonthlyType = async (data: Partial<MonthlyType>): Promise<MonthlyType> => {
    const response = await api.post<ApiResponse<MonthlyType>>(path, data);
    return response.data.data;
};

export const updateMonthlyType = async (id: number, data: Partial<MonthlyType>): Promise<MonthlyType> => {
    const response = await api.put<ApiResponse<MonthlyType>>(`${path}/${id}`, data);
    return response.data.data;
};

export const deleteMonthlyType = async (id: number): Promise<void> => {
    await api.delete(`${path}/${id}`);
};
