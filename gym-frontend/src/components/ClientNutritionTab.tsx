import React, { useState, useEffect } from 'react';
import { Utensils, Plus, CheckCircle2, Apple, Flame } from 'lucide-react';
import { getActiveNutritionPlan, getMealLogs, logMeal, deleteMealLog } from '../services/nutritionService';
import type { NutritionPlan, MealLog } from '../types/index';

interface Props {
  clientId: number;
}

export const ClientNutritionTab: React.FC<Props> = ({ clientId }) => {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [mealType, setMealType] = useState<MealLog['mealType']>('DESAYUNO');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [healthySnackReplaced, setHealthySnackReplaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const planData = await getActiveNutritionPlan(clientId);
      setPlan(planData);
      const mealsData = await getMealLogs(clientId);
      setMeals(mealsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    try {
      await logMeal(clientId, {
        mealType,
        description,
        calories: calories ? parseInt(calories) : 0,
        proteinGrams: proteinGrams ? parseInt(proteinGrams) : 0,
        healthySnackReplaced,
      });
      setDescription('');
      setCalories('');
      setProteinGrams('');
      setHealthySnackReplaced(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId: number) => {
    try {
      await deleteMealLog(clientId, mealId);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const totalCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + (m.proteinGrams || 0), 0);

  return (
    <div className="space-y-6">
      {/* Plan Objetivo */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {plan?.name || 'Plan de Recomposición Corporal'}
              </h3>
              <p className="text-xs text-slate-400">Distribución de Macronutrientes Diarios</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-center">
          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Calorías Meta</span>
            <p className="text-lg font-bold text-orange-400">{plan?.dailyCalories || 2200} kcal</p>
            <span className="text-[10px] text-slate-400">Consumidas: {totalCalories} kcal</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Proteínas</span>
            <p className="text-lg font-bold text-emerald-400">{plan?.proteinGrams || 160}g</p>
            <span className="text-[10px] text-slate-400">Consumidas: {totalProtein}g</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Carbohidratos</span>
            <p className="text-lg font-bold text-cyan-400">{plan?.carbsGrams || 220}g</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Grasas Saludables</span>
            <p className="text-lg font-bold text-yellow-400">{plan?.fatGrams || 65}g</p>
          </div>
        </div>

        {plan?.guidelines && (
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/40 text-xs text-slate-300">
            <strong>Pautas de Hábitos:</strong> {plan.guidelines}
          </div>
        )}
      </div>

      {/* Formulario de registro de comida */}
      <form onSubmit={handleAddMeal} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-orange-400" /> Registrar Comida / Hábitos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Comida</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            >
              <option value="DESAYUNO">Desayuno</option>
              <option value="ALMUERZO">Almuerzo</option>
              <option value="MERIENDA">Merienda</option>
              <option value="CENA">Cena</option>
              <option value="SNACK">Snack / Colación</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Descripción / Alimentos</label>
            <input
              type="text"
              placeholder="Ej: 3 huevos, tostadas integrales, palta, frutos secos"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Calorías (aprox kcal)</label>
            <input
              type="number"
              placeholder="450"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Proteínas (g)</label>
            <input
              type="number"
              placeholder="30"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={healthySnackReplaced}
                onChange={(e) => setHealthySnackReplaced(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0"
              />
              <Apple className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reemplacé galletitas por snack saludable</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 rounded-lg text-xs transition"
        >
          <Plus className="w-4 h-4" /> Guardar Registro de Comida
        </button>
      </form>

      {/* Registro de comidas de hoy */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Comidas Registradas Hoy</h4>
        {meals.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay comidas registradas para hoy.</p>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {meal.mealType}
                    </span>
                    {meal.healthySnackReplaced && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Snack saludable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-medium">{meal.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    {meal.calories || 0} kcal | {meal.proteinGrams || 0}g P
                  </span>
                  {meal.id && (
                    <button
                      onClick={() => handleDelete(meal.id!)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
