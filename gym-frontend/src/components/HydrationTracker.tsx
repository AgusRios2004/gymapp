import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Minus } from 'lucide-react';
import { getWaterLog, addWaterLog } from '../services/waterLogService';
import type { WaterLog } from '../types/index';

interface Props {
  clientId: number;
}

export const HydrationTracker: React.FC<Props> = ({ clientId }) => {
  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWater = async () => {
    try {
      const data = await getWaterLog(clientId);
      setWaterLog(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWater();
  }, [clientId]);

  const handleAdd = async (amount: number) => {
    setLoading(true);
    try {
      const updated = await addWaterLog(clientId, amount);
      setWaterLog(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const current = waterLog?.milliliters || 0;
  const target = waterLog?.targetMilliliters || 3000;
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display uppercase tracking-tight">Hidratación Diaria</h3>
            <p className="text-xs text-slate-500 font-medium">Objetivo recomendado: {target / 1000}L de agua</p>
          </div>
        </div>
        <span className="text-base font-black text-emerald-700 font-mono">{percentage}%</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200/60">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
        <span>Consumido: <strong className="text-slate-900 font-extrabold font-mono">{current} ml</strong></span>
        <span>Restante: <strong className="text-slate-900 font-extrabold font-mono">{Math.max(0, target - current)} ml</strong></span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <button
          onClick={() => handleAdd(250)}
          disabled={loading}
          className="min-h-11 flex items-center justify-center gap-1 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition border border-emerald-200 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> +250 ml
        </button>
        <button
          onClick={() => handleAdd(500)}
          disabled={loading}
          className="min-h-11 flex items-center justify-center gap-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow-sm shadow-emerald-600/20 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> +500 ml
        </button>
        <button
          onClick={() => handleAdd(-250)}
          disabled={loading || current === 0}
          className="min-h-11 flex items-center justify-center gap-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition border border-slate-200 disabled:opacity-50"
        >
          <Minus className="w-3.5 h-3.5" /> -250 ml
        </button>
      </div>
    </div>
  );
};
