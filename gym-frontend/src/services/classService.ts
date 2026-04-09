import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { GroupClass, Client } from '../types/index';

const path = '/classes';

export const getClasses = async (): Promise<GroupClass[]> => {
    const response = await api.get<ApiResponse<GroupClass[]>>(path);
    return response.data.data;
};

export const createClass = async (data: Partial<GroupClass> & { professorId: string, routineId?: string }): Promise<GroupClass> => {
    // We clean the data to match what the backend expects
    const { professorId, routineId, ...rest } = data;
    const payload = {
        ...rest,
        professor: { id: Number(professorId) },
        ...(routineId ? { routine: { id: Number(routineId) } } : {})
    };
    const response = await api.post<ApiResponse<GroupClass>>(path, payload);
    return response.data.data;
};

export const deleteClass = async (id: number): Promise<void> => {
    await api.delete(`${path}/${id}`);
};

export const getStudentsByClass = async (classId: number): Promise<Client[]> => {
    const response = await api.get<ApiResponse<Client[]>>(`${path}/${classId}/students`);
    return response.data.data;
};

export const assignClass = async (clientId: number, classId: number): Promise<Client> => {
    const response = await api.post<ApiResponse<Client>>(`/clients/${clientId}/assign-class/${classId}`);
    return response.data.data;
};

export const unassignClass = async (clientId: number): Promise<Client> => {
    const response = await api.delete<ApiResponse<Client>>(`/clients/${clientId}/unassign-class`);
    return response.data.data;
};
