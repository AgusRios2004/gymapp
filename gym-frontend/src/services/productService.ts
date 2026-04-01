import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { Product } from '../types/index';

const path = '/products';

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(path);
    return response.data.data;
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>(path, data);
    return response.data.data;
};

export const updateProduct = async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`${path}/${id}`, data);
    return response.data.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`${path}/${id}`);
};
