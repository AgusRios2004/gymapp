import api from '../lib/axios';
import type { Routine } from '../types/index';
import type { ApiResponse } from '../types/api.types';

const path = '/routines';

export const getRoutines = async (): Promise<Routine[]> => {
    const response = await api.get<ApiResponse<Routine[]>>(path);
    return response.data.data;
};
