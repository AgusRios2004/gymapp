import React from 'react';
import { Clock } from 'lucide-react';
import type { Assistance } from '../../../types';

interface ClientAssistanceTabProps {
  assistance: Assistance[];
}

export const ClientAssistanceTab: React.FC<ClientAssistanceTabProps> = ({ assistance }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Historial de Asistencia</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistance.length === 0 ? (
          <p className="col-span-full text-center py-8 text-gray-400">No hay registros de asistencia</p>
        ) : (
          assistance.map((a, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-blue-500 uppercase">{new Date(a.date).toLocaleString('es-ES', { month: 'short' })}</span>
                <span className="text-lg font-bold text-gray-900">{new Date(a.date).getDate()}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{new Date(a.date).toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {a.inputHour} hs
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
