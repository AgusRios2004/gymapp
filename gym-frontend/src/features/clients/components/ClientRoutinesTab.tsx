import React from 'react';
import { Plus } from 'lucide-react';
import type { Routine } from '../../../types';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface ClientRoutinesTabProps {
  routines: Routine[];
  onAssignRoutineClick: () => void;
}

export const ClientRoutinesTab: React.FC<ClientRoutinesTabProps> = ({ routines, onAssignRoutineClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h3 className="text-xl font-bold text-gray-900">Planes de Entrenamiento</h3>
         <Button variant="outline" size="sm" onClick={onAssignRoutineClick} className="gap-2">
           <Plus size={16} /> Nueva Asignación
         </Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {routines.length === 0 ? (
          <p className="text-center py-8 text-gray-400">No hay rutinas asignadas</p>
        ) : (
          routines.map((r) => (
            <div key={r.id} className={`p-6 rounded-2xl border ${r.active ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
              <div className="flex items-center justify-between mb-2">
                 <h4 className="font-bold text-gray-900">{r.name}</h4>
                 {r.active && <Badge variant="success">ACTIVA</Badge>}
              </div>
              <p className="text-sm text-gray-500 mb-4">{r.goal}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600">Ver Ejercicios</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
