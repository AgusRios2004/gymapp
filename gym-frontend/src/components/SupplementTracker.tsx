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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">Suplementación Diaria</h3>
          <p className="text-xs text-slate-400">Toma continua recomendada</p>
        </div>
      </div>

      <div className="space-y-3">
        <div
          onClick={() => !loading && toggleSupplement('creatine')}
          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
            log?.creatineTaken
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3">
            {log?.creatineTaken ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500" />
            )}
            <div>
              <p className="text-xs font-semibold">Creatina Monohidrato (5g)</p>
              <p className="text-[11px] text-slate-400">Toma diaria post-entrenamiento</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            {log?.creatineTaken ? 'Tomado' : 'Pendiente'}
          </span>
        </div>

        <div
          onClick={() => !loading && toggleSupplement('protein')}
          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
            log?.proteinTaken
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3">
            {log?.proteinTaken ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500" />
            )}
            <div>
              <p className="text-xs font-semibold">Proteína en Polvo (Whey)</p>
              <p className="text-[11px] text-slate-400">1 scoop (25-30g proteína)</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            {log?.proteinTaken ? 'Tomado' : 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
};
