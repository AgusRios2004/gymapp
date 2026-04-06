import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { GroupClass } from '../types/index';

const path = '/classes';

export const getClasses = async (): Promise<GroupClass[]> => {
    const response = await api.get<ApiResponse<GroupClass[]>>(path);
    return response.data.data;
};

export const createClass = async (data: Partial<GroupClass> & { professorId: string }): Promise<GroupClass> => {
    // We clean the data to match what the backend expects
    const { professorId, ...rest } = data;
    const payload = {
        ...rest,
        professor: { id: Number(professorId) }
    };
    const response = await api.post<ApiResponse<GroupClass>>(path, payload);
    return response.data.data;
};

export const deleteClass = async (id: number): Promise<void> => {
    await api.delete(`${path}/${id}`);
};
