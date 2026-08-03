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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Hidratación Diaria</h3>
            <p className="text-xs text-slate-400">Objetivo recomendando: {target / 1000}L de agua</p>
          </div>
        </div>
        <span className="text-sm font-bold text-blue-400">{percentage}%</span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-4 text-xs text-slate-300">
        <span>Consumido: <strong className="text-slate-100 font-bold">{current} ml</strong></span>
        <span>Restante: <strong className="text-slate-100 font-bold">{Math.max(0, target - current)} ml</strong></span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleAdd(250)}
          disabled={loading}
          className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium rounded-lg text-xs transition border border-slate-700 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> +250 ml
        </button>
        <button
          onClick={() => handleAdd(500)}
          disabled={loading}
          className="flex items-center justify-center gap-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> +500 ml
        </button>
        <button
          onClick={() => handleAdd(-250)}
          disabled={loading || current === 0}
          className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium rounded-lg text-xs transition border border-slate-700 disabled:opacity-50"
        >
          <Minus className="w-3.5 h-3.5" /> -250 ml
        </button>
      </div>
    </div>
  );
};
