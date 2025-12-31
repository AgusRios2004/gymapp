import api from '../lib/axios';
import { z } from 'zod';
import { ExerciseSchema } from '../types/schema.type';
import type { ApiResponse } from '../types/api.types';

export type ExerciseFormData = z.infer<typeof ExerciseSchema>;

export interface Exercise {
    id: number;
    name: string;
    muscleGroup: string;
    description?: string;
}

const path = '/exercises';

export const getExercises = async (): Promise<Exercise[]> => {
    const response = await api.get<ApiResponse<Exercise[]>>(path);
    return response.data.data;
};

export const createExercise = async (data: ExerciseFormData): Promise<Exercise> => {
    const response = await api.post<ApiResponse<Exercise>>(path, data);
    return response.data.data;
};