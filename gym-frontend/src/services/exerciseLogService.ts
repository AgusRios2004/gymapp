import axios from 'axios';
import type { ExerciseLog } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const saveExerciseLog = async (log: ExerciseLog): Promise<ExerciseLog> => {
    const response = await axios.post(`${API_URL}/exercise-logs`, log);
    return response.data.data;
};

export const getLatestExerciseLog = async (clientId: number, exerciseId: number): Promise<ExerciseLog | null> => {
    const response = await axios.get(`${API_URL}/exercise-logs/client/${clientId}/exercise/${exerciseId}/latest`);
    return response.data.data;
};

export const getExerciseHistory = async (clientId: number, exerciseId: number): Promise<ExerciseLog[]> => {
    const response = await axios.get(`${API_URL}/exercise-logs/client/${clientId}/exercise/${exerciseId}/history`);
    return response.data.data;
};
