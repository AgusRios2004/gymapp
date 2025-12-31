import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { AssignRoutineSchema } from '../../types/schema.type';
import type { Client, Routine } from '../../types/index';
// Asumimos que existe este servicio, si no, deberás crearlo
import { getRoutines } from '../../services/routineService';
import { DAYS_OF_WEEK } from '../../constants/time';

type AssignRoutineFormData = z.infer<typeof AssignRoutineSchema>;

interface AssignRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (data: AssignRoutineFormData) => void;
  isLoading?: boolean;
}

const AssignRoutineModal: React.FC<AssignRoutineModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
  isLoading = false,
}) => {
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
  // Mapa: dayOrder -> assignedDay (ej: 1 -> "MONDAY")
  const [scheduleMap, setScheduleMap] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Cargar rutinas (templates)
  const { data: routines = [] } = useQuery({
    queryKey: ['routines', 'templates'],
    queryFn: async () => {
      // Asumimos que getRoutines acepta filtros o trae todas y filtramos aquí
      const allRoutines = await getRoutines(); 
      return Array.isArray(allRoutines) ? allRoutines.filter((r: Routine) => r.isTemplate) : [];
    },
    enabled: isOpen, // Solo cargar cuando se abre el modal
  });

  // Resetear estado al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setSelectedRoutineId(null);
      setScheduleMap({});
      setSearchTerm('');
      setNotes('');
      setErrors([]);
    }
  }, [isOpen, client]);

  // Obtener la rutina seleccionada completa para ver sus días
  const selectedRoutine = routines.find((r: Routine) => r.id === selectedRoutineId);

  // Filtrar rutinas para el buscador (mantenemos la seleccionada visible aunque no coincida con el filtro)
  const filteredRoutines = routines.filter((r: Routine) => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.id === selectedRoutineId
  );

  const handleSave = () => {
    if (!client || !selectedRoutineId) {
      setErrors(["Debes seleccionar una rutina."]);
      return;
    }

    const schedule = Object.entries(scheduleMap).map(([dayOrder, assignedDay]) => ({
      dayOrder: Number(dayOrder),
      assignedDay,
    }));

    const payload = {
      clientId: client.id,
      routineTemplateId: selectedRoutineId,
      schedule,
      notes,
    };

    const result = AssignRoutineSchema.safeParse(payload);

    if (!result.success) {
      const errorMessages = result.error.issues.map((e) => e.message);
      setErrors(errorMessages);
      return;
    }

    if (selectedRoutine?.days && schedule.length < selectedRoutine.days.length) {
        setErrors(["Debes asignar un día de la semana a cada día de la rutina."]);
        return;
    }

    onSave(result.data);
  };

  if (!isOpen || !client) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Asignar Rutina</h3>
            <p className="text-sm text-gray-500">Alumno: {client.name} {client.lastName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div className="space-y-2">
            <Input
              label="Seleccionar Plantilla"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="mb-2"
            />
            
            <select
              className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={selectedRoutineId || ''}
              onChange={(e) => {
                setSelectedRoutineId(Number(e.target.value));
                setScheduleMap({});
              }}
              disabled={isLoading}
            >
              <option value="">-- Selecciona una rutina --</option>
              {filteredRoutines.map((routine: Routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name} ({routine.goal})
                </option>
              ))}
            </select>
          </div>

          {/* Mapeo de Días */}
          {selectedRoutine && selectedRoutine.days && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Planificación Semanal</h4>
              <p className="text-xs text-gray-500 mb-4">Asigna qué día de la semana realizará cada sesión.</p>
              
              {selectedRoutine.days.sort((a: any, b: any) => a.dayOrder - b.dayOrder).map((day: any) => (
                <div key={day.id || day.dayOrder} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg border shadow-sm min-w-[80px] text-center">
                    Día {day.dayOrder}
                  </span>
                  <span className="text-gray-400">➜</span>
                  <select
                    className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                    value={scheduleMap[day.dayOrder] || ''}
                    onChange={(e) => setScheduleMap(prev => ({ ...prev, [day.dayOrder]: e.target.value }))}
                  >
                    <option value="">Seleccionar día...</option>
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <TextArea
            label="Notas / Observaciones"
            placeholder="Instrucciones especiales para el alumno..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />

          {errors.length > 0 && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {errors.map((err, idx) => <p key={idx}>• {err}</p>)}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Asignando...' : 'Confirmar Asignación'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssignRoutineModal;