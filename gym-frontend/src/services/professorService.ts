import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { Professor } from '../types/index';

const path = '/professors';

export const getProfessors = async (active?: boolean): Promise<Professor[]> => {
    const params = active !== undefined ? { active } : {};
    const response = await api.get<ApiResponse<Professor[]>>(path, { params });
    return response.data.data;
};

export const deleteProfessor = async (id: number): Promise<void> => {
    await api.delete(`${path}/${id}`);
};

export const createProfessor = async (data: Partial<Professor>): Promise<Professor> => {
    const response = await api.post<ApiResponse<Professor>>(path, data);
    return response.data.data;
};
