import React from 'react';
import ReactDOM from 'react-dom';
import type { Routine } from '../../types/index';

interface RoutineDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: Routine | null;
}

const RoutineDetailsModal: React.FC<RoutineDetailsModalProps> = ({ isOpen, onClose, routine }) => {
  if (!isOpen || !routine) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{routine.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{routine.goal}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white flex-1">
          {routine.days && routine.days.length > 0 ? (
            routine.days.sort((a, b) => a.dayOrder - b.dayOrder).map((day) => (
              <div key={day.id || day.dayOrder} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                  <span className="font-bold text-blue-700">Día {day.dayOrder}</span>
                  <span className="text-xs text-blue-600 font-medium bg-white px-2 py-1 rounded-full border border-blue-200">
                    {day.routineExercises.length} Ejercicios
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {day.routineExercises.map((ex, idx) => (
                    <div key={ex.id || idx} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {ex.exerciseName || `Ejercicio #${ex.exerciseId}`}
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-600">
                        <div className="text-center min-w-[3rem]">
                          <span className="block font-bold text-gray-900">{ex.sets}</span>
                          <span className="text-[10px] uppercase text-gray-400">Series</span>
                        </div>
                        <div className="text-center min-w-[3rem]">
                          <span className="block font-bold text-gray-900">{ex.repetitions}</span>
                          <span className="text-[10px] uppercase text-gray-400">Reps</span>
                        </div>
                        {ex.weight !== undefined && ex.weight > 0 && (
                          <div className="text-center min-w-[3rem]">
                            <span className="block font-bold text-gray-900">{ex.weight}kg</span>
                            <span className="text-[10px] uppercase text-gray-400">Peso</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No hay días configurados para esta rutina.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RoutineDetailsModal;