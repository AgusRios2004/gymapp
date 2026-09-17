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
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display uppercase tracking-tight">
                {plan?.name || 'Plan de Recomposición Corporal'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Distribución de Macronutrientes Diarios</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold">Calorías Meta</span>
            <p className="text-xl font-black text-rose-600 font-mono">{plan?.dailyCalories || 2200} kcal</p>
            <span className="text-[10px] text-slate-500 font-bold">Consumidas: {totalCalories} kcal</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold">Proteínas</span>
            <p className="text-xl font-black text-emerald-700 font-mono">{plan?.proteinGrams || 160}g</p>
            <span className="text-[10px] text-slate-500 font-bold">Consumidas: {totalProtein}g</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold">Carbohidratos</span>
            <p className="text-xl font-black text-teal-600 font-mono">{plan?.carbsGrams || 220}g</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold">Grasas Saludables</span>
            <p className="text-xl font-black text-slate-700 font-mono">{plan?.fatGrams || 65}g</p>
          </div>
        </div>

        {plan?.guidelines && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600 font-medium">
            <strong className="text-slate-900">Pautas de Hábitos:</strong> {plan.guidelines}
          </div>
        )}
      </div>

      {/* Formulario de registro de comida */}
      <form onSubmit={handleAddMeal} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-display uppercase tracking-tight">
          <Utensils className="w-4 h-4 text-emerald-600" /> Registrar Comida / Hábitos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Comida</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealLog['mealType'])}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="DESAYUNO">Desayuno</option>
              <option value="ALMUERZO">Almuerzo</option>
              <option value="MERIENDA">Merienda</option>
              <option value="CENA">Cena</option>
              <option value="SNACK">Snack / Colación</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">Descripción / Alimentos</label>
            <input
              type="text"
              placeholder="Ej: 3 huevos, tostadas integrales, palta, frutos secos"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Calorías (aprox kcal)</label>
            <input
              type="number"
              placeholder="450"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Proteínas (g)</label>
            <input
              type="number"
              placeholder="30"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={healthySnackReplaced}
                onChange={(e) => setHealthySnackReplaced(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Apple className="w-4 h-4 text-emerald-600" />
              <span>Reemplacé galletitas por snack saludable</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Guardar Registro de Comida
        </button>
      </form>

      {/* Registro de comidas de hoy */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
        <h4 className="text-sm font-extrabold text-slate-900 font-display uppercase tracking-tight">Comidas Registradas Hoy</h4>
        {meals.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay comidas registradas para hoy.</p>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {meal.mealType}
                    </span>
                    {meal.healthySnackReplaced && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200 font-extrabold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Snack saludable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-900 mt-1 font-semibold">{meal.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono font-bold">
                    {meal.calories || 0} kcal | {meal.proteinGrams || 0}g P
                  </span>
                  {meal.id && (
                    <button
                      onClick={() => handleDelete(meal.id!)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold transition"
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
