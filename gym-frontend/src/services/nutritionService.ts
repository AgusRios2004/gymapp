import api from '../lib/axios';
import type { NutritionPlan, MealLog } from '../types/index';

export const getActiveNutritionPlan = async (clientId: number): Promise<NutritionPlan | null> => {
  try {
    const response = await api.get<NutritionPlan>(`/clients/${clientId}/nutrition/plan`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createNutritionPlan = async (clientId: number, plan: Partial<NutritionPlan>): Promise<NutritionPlan> => {
  const response = await api.post<NutritionPlan>(`/clients/${clientId}/nutrition/plan`, plan);
  return response.data;
};

export const getMealLogs = async (clientId: number, date?: string): Promise<MealLog[]> => {
  const params = date ? { date } : {};
  const response = await api.get<MealLog[]>(`/clients/${clientId}/nutrition/meals`, { params });
  return response.data;
};

export const logMeal = async (clientId: number, meal: Partial<MealLog>): Promise<MealLog> => {
  const response = await api.post<MealLog>(`/clients/${clientId}/nutrition/meals`, meal);
  return response.data;
};

export const deleteMealLog = async (clientId: number, mealId: number): Promise<void> => {
  await api.delete(`/clients/${clientId}/nutrition/meals/${mealId}`);
};
