import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Circle } from 'lucide-react';
import { getSupplementLog, saveSupplementLog } from '../services/supplementService';
import type { SupplementLog } from '../types/index';

interface Props {
  clientId: number;
}

export const SupplementTracker: React.FC<Props> = ({ clientId }) => {
  const [log, setLog] = useState<SupplementLog | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLog = async () => {
    try {
      const data = await getSupplementLog(clientId);
      setLog(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLog();
  }, [clientId]);

  const toggleSupplement = async (type: 'creatine' | 'protein') => {
    if (!log) return;
    setLoading(true);
    const updated = {
      ...log,
      creatineTaken: type === 'creatine' ? !log.creatineTaken : log.creatineTaken,
      proteinTaken: type === 'protein' ? !log.proteinTaken : log.proteinTaken,
    };
    try {
      const saved = await saveSupplementLog(clientId, updated);
      setLog(saved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-display uppercase tracking-tight">Suplementación Diaria</h3>
          <p className="text-xs text-slate-500 font-medium">Toma continua recomendada para rendimiento</p>
        </div>
      </div>

      <div className="space-y-3">
        <div
          onClick={() => !loading && toggleSupplement('creatine')}
          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
            log?.creatineTaken
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {log?.creatineTaken ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="text-xs font-bold">Creatina Monohidrato (5g)</p>
              <p className="text-[11px] text-slate-500">Toma diaria post-entrenamiento</p>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg border ${
            log?.creatineTaken 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
              : 'bg-white text-slate-500 border-slate-200'
          }`}>
            {log?.creatineTaken ? 'Tomado' : 'Pendiente'}
          </span>
        </div>

        <div
          onClick={() => !loading && toggleSupplement('protein')}
          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
            log?.proteinTaken
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {log?.proteinTaken ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="text-xs font-bold">Proteína en Polvo (Whey)</p>
              <p className="text-[11px] text-slate-500">1 scoop (25-30g proteína)</p>
            </div>
          </div>
          <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg border ${
            log?.proteinTaken 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
              : 'bg-white text-slate-500 border-slate-200'
          }`}>
            {log?.proteinTaken ? 'Tomado' : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
};
