import { useState } from 'react';
import { Calendar, CheckCircle2, Flame, ShieldAlert, Dumbbell, PlayCircle } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

type TrainingCategory = 'Empuje' | 'Tracción' | 'Pierna' | 'Refuerzo';

interface TrainingDay {
  dayName: string;
  dayCode: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  category: TrainingCategory;
  title: string;
  exercises: string[];
  cardioLiss: string;
}

// Paleta fija por tipo de entrenamiento (no por día) — ver ADR-0008 y docs/DESIGN_SYSTEM.md
const CATEGORY_STYLES: Record<TrainingCategory, { card: string; badge: string }> = {
  Empuje: { card: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  Tracción: { card: 'border-violet-200 bg-violet-50', badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  Pierna: { card: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  Refuerzo: { card: 'border-teal-200 bg-teal-50', badge: 'bg-teal-100 text-teal-700 border-teal-200' },
};

const LEGEND: { label: TrainingCategory | 'Cardio'; dot: string }[] = [
  { label: 'Empuje', dot: 'bg-blue-500' },
  { label: 'Tracción', dot: 'bg-violet-500' },
  { label: 'Pierna', dot: 'bg-orange-500' },
  { label: 'Refuerzo', dot: 'bg-teal-500' },
  { label: 'Cardio', dot: 'bg-cyan-500' },
];

const WEEK_SCHEME: TrainingDay[] = [
  {
    dayName: 'Lunes',
    dayCode: 'MONDAY',
    category: 'Empuje',
    title: 'Pecho + Bíceps + Hombro Anterior',
    exercises: ['Press de Banca Plano', 'Press Inclinado', 'Aperturas con Mancuerna', 'Curl de Bíceps', 'Curl Martillo', 'Press Militar de Hombros'],
    cardioLiss: '10 a 15 min de Cinta LISS (Ritmo Firme)',
  },
  {
    dayName: 'Martes',
    dayCode: 'TUESDAY',
    category: 'Tracción',
    title: 'Espalda + Tríceps + Hombro Posterior',
    exercises: ['Jalón al Pecho', 'Remo con Polea / Mancuerna', 'Pájaros / Hombro Trasero', 'Extensión de Tríceps en Polea', 'Press Francés o Katana'],
    cardioLiss: '10 a 15 min de Cinta LISS (Ritmo Firme)',
  },
  {
    dayName: 'Miércoles',
    dayCode: 'WEDNESDAY',
    category: 'Pierna',
    title: 'Pierna Completa + Abdominales',
    exercises: ['Sentadillas Libres (Prioridad)', 'Sillón de Cuádriceps', 'Camilla de Isquiotibiales', 'Elevación de Gemelos', 'Abdominales Crunch / Elevación'],
    cardioLiss: '10 a 15 min de Cinta Suave (Regenerativo)',
  },
  {
    dayName: 'Jueves',
    dayCode: 'THURSDAY',
    category: 'Refuerzo',
    title: 'Hombros + Brazos + Abdomen',
    exercises: ['Vuelos Laterales (Deltoides Lateral)', 'Superconjunto Bíceps + Tríceps', 'Planchas Abdominales Iso', 'Abdomen Bajo'],
    cardioLiss: '15 min de Cinta LISS (Buen Ritmo)',
  },
];

export default function TrainingSchemeWidget() {
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});

  const toggleDayCompleted = (dayCode: string) => {
    const isDone = !completedDays[dayCode];
    setCompletedDays(prev => ({ ...prev, [dayCode]: isDone }));
    if (isDone) {
      toast.success(`🔥 ¡Sesión completada exitosamente! Pesas + Cinta LISS finalizadas.`);
    }
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl p-6 border border-slate-200 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Dumbbell size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Esquema de Entrenamiento 4 Días + Cardio LISS</h3>
            <p className="text-xs text-slate-500 mt-0.5">Frecuencia semanal optimizada: 45 min pesas + 10-15 min cinta LISS de cierre</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar size={16} className="text-slate-500" />
          <span>Lunes a Jueves (Viernes a Domingo: Descanso Total)</span>
        </div>
      </div>

      {/* Leyenda de paleta funcional (fija, no por día — ADR-0008) */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {LEGEND.map(({ label, dot }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {WEEK_SCHEME.map((day) => {
          const isDone = !!completedDays[day.dayCode];
          const styles = CATEGORY_STYLES[day.category];
          return (
            <div
              key={day.dayCode}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isDone ? 'border-emerald-300 bg-emerald-50' : styles.card
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isDone ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : styles.badge}`}>
                    {day.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{day.dayName}</span>
                </div>

                {isDone && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={14} /> Listo
                  </span>
                )}

                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{day.title}</h4>

                {/* Lista de ejercicios principales */}
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {day.exercises.map((ex, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bloque destacado de Cardio LISS — color fijo, no varía por categoría */}
              <div className="pt-3 border-t border-slate-200/80 space-y-3">
                <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-200 flex items-center gap-2.5">
                  <Flame size={18} className="text-cyan-600 shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-bold text-cyan-700 block">Cierre Cardio LISS</span>
                    <span className="text-slate-500">{day.cardioLiss}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isDone ? "primary" : "outline"}
                  onClick={() => toggleDayCompleted(day.dayCode)}
                  leftIcon={isDone ? <CheckCircle2 size={14} /> : <PlayCircle size={14} />}
                  className={`w-full rounded-xl text-xs gap-2 ${
                    isDone ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isDone ? 'Sesión Completada' : 'Marcar Sesión Hecha'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Días de Descanso Obligatorio */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">🔒 Viernes, Sábado y Domingo: Descanso Total Obligatorio</h4>
            <p className="text-xs text-slate-500">Permite la supercompensación muscular y regeneración del sistema nervioso. 3L de agua + 5g creatina.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
          Recuperación Activa
        </span>
      </div>
    </div>
  );
}
