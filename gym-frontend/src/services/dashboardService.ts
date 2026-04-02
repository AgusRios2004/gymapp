import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { DashboardStats } from '../types/index';

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
};
