import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { PhysicalRecord } from '../types/index';

const path = '/physical-records';

export const getPhysicalRecords = async (clientId: number): Promise<PhysicalRecord[]> => {
    const response = await api.get<ApiResponse<PhysicalRecord[]>>(`${path}/client/${clientId}`);
    return response.data.data;
};

export const createPhysicalRecord = async (clientId: number, data: Partial<PhysicalRecord>): Promise<PhysicalRecord> => {
    const response = await api.post<ApiResponse<PhysicalRecord>>(`${path}/client/${clientId}`, data);
    return response.data.data;
};
