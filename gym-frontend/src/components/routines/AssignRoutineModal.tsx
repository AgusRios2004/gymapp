import { useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Check, Search, X } from 'lucide-react';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { EmptyState } from '../ui/EmptyState';
import { AssignRoutineSchema } from '../../types/schema.type';
import type { AssignRoutineRequest, Client, Routine } from '../../types';
import { getRoutines, assignRoutineToClient } from '../../services/routineService';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { DAYS_OF_WEEK } from '../../constants/time';

interface AssignRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave?: (data: AssignRoutineRequest) => void;
  isLoading?: boolean;
}

const AssignRoutineModal: React.FC<AssignRoutineModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const queryClient = useQueryClient();
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  // Mapa: dayOrder -> assignedDay (ej: 1 -> "MONDAY"), para la Agenda Semanal (spec §B.9, RoutineService.assignComplexRoutine).
  const [scheduleMap, setScheduleMap] = useState<Record<number, string>>({});
  const shouldCloseRef = useRef(true);

  // Plantillas disponibles para asignar.
  const { data: templates = [] } = useQuery({
    queryKey: ['routines', 'templates'],
    queryFn: async () => {
      const allRoutines = await getRoutines();
      return Array.isArray(allRoutines) ? allRoutines.filter((r: Routine) => r.active !== false) : [];
    },
    enabled: isOpen,
  });

  // Rutina vigente del alumno: `client.routineActive`, no `active` de la plantilla (spec §B.7-9;
  // `active` de la plantilla no distingue asignaciones históricas de la vigente cuando el alumno
  // tiene más de una rutina con active=true).
  const activeRoutine = client?.routineActive ?? null;

  // Resetear estado al abrir o al cambiar de cliente. Se ajusta durante el
  // render en vez de en un useEffect, para no disparar un render extra en cascada.
  const [prevReset, setPrevReset] = useState({ isOpen, client });
  if (isOpen !== prevReset.isOpen || client !== prevReset.client) {
    setPrevReset({ isOpen, client });
    if (isOpen) {
      setSelectedRoutine(null);
      setSearch('');
      setNotes('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setScheduleMap({});
    }
  }

  const handleSelectRoutine = (template: Routine) => {
    setSelectedRoutine(template);
    setScheduleMap({});
  };

  const mutation = useMutation({
    mutationFn: (data: ReturnType<typeof AssignRoutineSchema.parse>) =>
      assignRoutineToClient({ ...data, schedule: data.schedule ?? [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-routines', client?.id] });
      queryClient.invalidateQueries({ queryKey: ['client-routine', client?.id] });
      queryClient.invalidateQueries({ queryKey: ['client', client?.id] });
      toast.success('Rutina asignada correctamente');

      if (shouldCloseRef.current) {
        onClose();
      } else {
        // Resetear selección/notas para permitir cargar otra inmediatamente.
        setSelectedRoutine(null);
        setNotes('');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al asignar la rutina');
    },
  });

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(
      (t) => t.name.toLowerCase().includes(term) || t.goal.toLowerCase().includes(term),
    );
  }, [templates, search]);

  const routineDays = useMemo(
    () => [...(selectedRoutine?.days ?? [])].sort((a, b) => (a.dayOrder || 0) - (b.dayOrder || 0)),
    [selectedRoutine],
  );
  const scheduleComplete = routineDays.every((day) => !!scheduleMap[day.dayOrder]);

  const handleSave = (closeAfterSave: boolean) => {
    if (!client || !selectedRoutine || !scheduleComplete) return;
    shouldCloseRef.current = closeAfterSave;

    const schedule = routineDays.map((day) => ({
      dayOrder: day.dayOrder,
      assignedDay: scheduleMap[day.dayOrder],
    }));

    const result = AssignRoutineSchema.safeParse({
      clientId: client.id,
      routineTemplateId: selectedRoutine.id,
      startDate,
      notes,
      schedule,
    });
    if (!result.success) return;

    mutation.mutate(result.data);
  };

  useEscapeKey(isOpen && !!client, onClose);

  if (!isOpen || !client) return null;

  const canSave = !!selectedRoutine && !mutation.isPending && scheduleComplete;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-[560px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-64px)] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden pt-2 pb-1 flex justify-center shrink-0">
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start gap-4 shrink-0">
          <div className="min-w-0">
            <h3 className="text-xl font-black font-display uppercase tracking-tight text-slate-900">Asignar rutina</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Para <span className="font-semibold text-slate-900">{client.name} {client.lastName}</span>
              {activeRoutine && (
                <span className="hidden sm:inline"> · rutina actual: {activeRoutine.name}</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="h-11 w-11 shrink-0 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-3">
            <Input
              placeholder="Buscar plantilla"
              leftIcon={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {templates.length === 0 ? (
              <EmptyState title="Todavía no hay plantillas de rutina" />
            ) : filteredTemplates.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No hay plantillas que coincidan</p>
            ) : (
              <div role="radiogroup" aria-label="Plantillas de rutina" className="space-y-2 max-h-64 overflow-y-auto">
                {filteredTemplates.map((template) => {
                  const checked = selectedRoutine?.id === template.id;
                  const isCurrent = activeRoutine?.id === template.id;
                  return (
                    <div
                      key={template.id}
                      role="radio"
                      aria-checked={checked}
                      tabIndex={0}
                      onClick={() => handleSelectRoutine(template)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectRoutine(template);
                        }
                      }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                        checked ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          checked ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300'
                        }`}
                      >
                        {checked && <Check size={12} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900">{template.name}</p>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                              Actual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{template.goal}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {routineDays.length > 0 && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Agenda semanal</h4>
              <p className="text-xs text-slate-500">Elegí qué día de la semana se realiza cada sesión de la rutina.</p>

              {routineDays.map((day) => (
                <div key={day.id ?? day.dayOrder} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 shrink-0">
                    Sesión {day.dayOrder}
                  </span>
                  <select
                    aria-label={`Día de la semana para la sesión ${day.dayOrder}`}
                    className="flex-1 min-h-11 px-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-sm"
                    value={scheduleMap[day.dayOrder] || ''}
                    onChange={(e) => setScheduleMap((prev) => ({ ...prev, [day.dayOrder]: e.target.value }))}
                  >
                    <option value="">Seleccionar día...</option>
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <Input
            label="Fecha de inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={mutation.isPending}
            helperText="Pasa a ser la rutina actual del alumno."
          />

          <TextArea
            label="Notas (opcional)"
            placeholder="Indicaciones para el alumno"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white sm:bg-slate-50 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="hidden sm:inline-flex">
            Cancelar
          </Button>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:ml-auto">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={!canSave}
              className="w-full sm:w-auto h-11 whitespace-nowrap"
            >
              Asignar y cargar otra
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={!canSave}
              className="w-full sm:w-auto h-12 sm:h-11 whitespace-nowrap"
            >
              {mutation.isPending ? 'Asignando…' : 'Asignar rutina'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssignRoutineModal;
