import { useState } from 'react';
import { Target, Scale, Activity, Flame, Edit2, Check } from 'lucide-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateClient } from '../../services/clientService';
import type { Client } from '../../types';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import Modal from '../ui/Modal';

interface RecompositionWidgetProps {
  client: Client;
  latestWeight?: number;
  latestFat?: number;
  latestMuscle?: number;
}

export default function RecompositionWidget({ client, latestWeight, latestFat, latestMuscle }: RecompositionWidgetProps) {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const height = client.height || 1.78;
  const targetWeight = client.targetWeight || 80.0;
  const targetFat = client.targetFatPercentage || 14.0;
  const targetMuscle = client.targetMuscleMass || 35.0;
  const primaryGoal = client.primaryGoal || 'Recomposición Corporal';

  const currentWeight = latestWeight || targetWeight;
  const currentFat = latestFat || 20.0;
  const currentMuscle = latestMuscle || 30.0;

  // Form local state for editing goals
  const [form, setForm] = useState({
    height: String(height),
    targetWeight: String(targetWeight),
    targetFatPercentage: String(targetFat),
    targetMuscleMass: String(targetMuscle),
    primaryGoal: primaryGoal
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: Partial<Client>) => updateClient(client.id, data as Client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', client.id] });
      toast.success("🎯 Metas de recomposición corporal actualizadas");
      setIsEditModalOpen(false);
    },
    onError: () => toast.error("❌ Error al guardar metas de recomposición")
  });

  // Calculate BMI
  const heightInMeters = height > 3.0 ? height / 100.0 : height;
  const computedBmi = currentWeight && heightInMeters > 0 
    ? Math.round((currentWeight / (heightInMeters * heightInMeters)) * 10) / 10 
    : client.bmi || 25.0;

  // Lean mass and Fat mass estimation in kg
  const fatMassKg = Math.round((currentWeight * (currentFat / 100.0)) * 10) / 10;
  const leanMassKg = Math.round((currentWeight - fatMassKg) * 10) / 10;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/50 space-y-6">
      {/* Header Widget */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Target size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">Objetivo de Recomposición Corporal</h3>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {primaryGoal}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Mantener/Aumentar Masa Muscular & Reducir Grasa</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditModalOpen(true)}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl gap-2 text-xs"
        >
          <Edit2 size={14} /> Editar Metas
        </Button>
      </div>

      {/* Grid Indicadores Biométricos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Estatura / IMC */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ESTATURA & IMC</span>
            <Activity size={14} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{heightInMeters} m</span>
            <span className="text-xs font-bold text-indigo-400">IMC {computedBmi}</span>
          </div>
          <p className="text-[11px] text-slate-400">Estatura base</p>
        </div>

        {/* Peso Actual vs Meta */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>PESO OBJETIVO</span>
            <Scale size={14} className="text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">{currentWeight} kg</span>
            <span className="text-xs font-medium text-slate-400">/ Meta: {targetWeight} kg</span>
          </div>
          <p className="text-[11px] text-slate-400">Recomposición (sin bajar drásticamente)</p>
        </div>

        {/* Porcentaje Grasa Actual vs Meta */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>% GRASA CORPORAL</span>
            <Flame size={14} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{currentFat}%</span>
            <span className="text-xs font-medium text-slate-400">/ Meta: {targetFat}%</span>
          </div>
          <p className="text-[11px] text-slate-400">Est. Grasa: {fatMassKg} kg</p>
        </div>

        {/* Masa Muscular */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>MASA MUSCULAR</span>
            <Activity size={14} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{currentMuscle}%</span>
            <span className="text-xs font-medium text-slate-400">/ Meta: {targetMuscle}%</span>
          </div>
          <p className="text-[11px] text-slate-400">Est. Masa Magra: {leanMassKg} kg</p>
        </div>
      </div>

      {/* Modal de edición de metas */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Metas de Recomposición Corporal">
        <form onSubmit={(e) => {
          e.preventDefault();
          updateClientMutation.mutate({
            height: Number(form.height),
            targetWeight: Number(form.targetWeight),
            targetFatPercentage: Number(form.targetFatPercentage),
            targetMuscleMass: Number(form.targetMuscleMass),
            primaryGoal: form.primaryGoal
          });
        }} className="space-y-4 text-gray-900">
          <Input 
            label="Estatura (en metros, ej: 1.78)" 
            type="number" 
            step="0.01" 
            required 
            value={form.height} 
            onChange={e => setForm({...form, height: e.target.value})} 
          />
          <div className="grid grid-cols-3 gap-3">
            <Input 
              label="Peso Objetivo (kg)" 
              type="number" 
              step="0.5" 
              required 
              value={form.targetWeight} 
              onChange={e => setForm({...form, targetWeight: e.target.value})} 
            />
            <Input 
              label="Grasa Objetivo (%)" 
              type="number" 
              step="0.5" 
              required 
              value={form.targetFatPercentage} 
              onChange={e => setForm({...form, targetFatPercentage: e.target.value})} 
            />
            <Input 
              label="Músculo Objetivo (%)" 
              type="number" 
              step="0.5" 
              required 
              value={form.targetMuscleMass} 
              onChange={e => setForm({...form, targetMuscleMass: e.target.value})} 
            />
          </div>
          <Input 
            label="Objetivo Principal" 
            required 
            value={form.primaryGoal} 
            onChange={e => setForm({...form, primaryGoal: e.target.value})} 
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" isLoading={updateClientMutation.isPending}>
              <Check size={16} /> Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
