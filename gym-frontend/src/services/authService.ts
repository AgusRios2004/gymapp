import api from '../lib/axios';
import type { User } from '../types/index';
import type { ApiResponse } from '../types/api.types';

const path = '/auth';

export const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(`${path}/login`, { email, password });
    return response.data.data;
};
