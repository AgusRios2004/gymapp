import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { Payment, MonthlyPaymentRequest, ProductPaymentRequest, MonthlyType } from '../types/index';

const path = '/payments';

export const getAllPayments = async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(path);
    return response.data.data;
};

export const createMonthlyPayment = async (data: MonthlyPaymentRequest): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>(`${path}/monthly`, data);
    return response.data.data;
};

export const createProductPayment = async (data: ProductPaymentRequest): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>(`${path}/product`, data);
    return response.data.data;
};

export const getMonthlyTypes = async (): Promise<MonthlyType[]> => {
    const response = await api.get<ApiResponse<MonthlyType[]>>('/monthly-type');
    return response.data.data;
};
