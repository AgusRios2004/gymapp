import { useState } from 'react';
import { Calendar, CheckCircle2, Flame, ShieldAlert, Dumbbell, PlayCircle } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-toastify';


interface TrainingDay {
  dayName: string;
  dayCode: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  colorTheme: string;
  badgeBg: string;
  title: string;
  exercises: string[];
  cardioLiss: string;
  isRestDay: boolean;
}

const WEEK_SCHEME: TrainingDay[] = [
  {
    dayName: 'Lunes',
    dayCode: 'MONDAY',
    colorTheme: 'border-red-500/40 bg-red-950/20 text-red-400',
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/30',
    title: 'Pecho + Bíceps + Hombro Anterior',
    exercises: ['Press de Banca Plano', 'Press Inclinado', 'Aperturas con Mancuerna', 'Curl de Bíceps', 'Curl Martillo', 'Press Militar de Hombros'],
    cardioLiss: '10 a 15 min de Cinta LISS (Ritmo Firme)',
    isRestDay: false
  },
  {
    dayName: 'Martes',
    dayCode: 'TUESDAY',
    colorTheme: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
    badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    title: 'Espalda + Tríceps + Hombro Posterior',
    exercises: ['Jalón al Pecho', 'Remo con Polea / Mancuerna', 'Pájaros / Hombro Trasero', 'Extensión de Tríceps en Polea', 'Press Francés o Katana'],
    cardioLiss: '10 a 15 min de Cinta LISS (Ritmo Firme)',
    isRestDay: false
  },
  {
    dayName: 'Miércoles',
    dayCode: 'WEDNESDAY',
    colorTheme: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    title: 'Pierna Completa + Abdominales',
    exercises: ['Sentadillas Libres (Prioridad)', 'Sillón de Cuádriceps', 'Camilla de Isquiotibiales', 'Elevación de Gemelos', 'Abdominales Crunch / Elevación'],
    cardioLiss: '10 a 15 min de Cinta Suave (Regenerativo)',
    isRestDay: false
  },
  {
    dayName: 'Jueves',
    dayCode: 'THURSDAY',
    colorTheme: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    title: 'Refuerzo: Hombros + Brazos + Abdomen',
    exercises: ['Vuelos Laterales (Deltoides Lateral)', 'Superconjunto Bíceps + Tríceps', 'Planchas Abdominales Iso', 'Abdomen Bajo'],
    cardioLiss: '15 min de Cinta LISS (Buen Ritmo)',
    isRestDay: false
  },
  {
    dayName: 'Viernes - Domingo',
    dayCode: 'FRIDAY',
    colorTheme: 'border-slate-700 bg-slate-900/40 text-slate-400',
    badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
    title: 'Descanso Total & Recuperación Muscular',
    exercises: ['Reposo físico', 'Hidratación adecuada (3L agua)', 'Toma continua de Creatina (5g)'],
    cardioLiss: 'Sin cardio o caminata recreativa ligera',
    isRestDay: true
  }
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
    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Dumbbell size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Esquema de Entrenamiento 4 Días + Cardio LISS</h3>
            <p className="text-xs text-slate-400 mt-0.5">Frecuencia semanal optimizada: 45 min pesas + 10-15 min cinta LISS de cierre</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700 text-xs font-semibold text-slate-300">
          <Calendar size={16} className="text-blue-400" />
          <span>Lunes a Jueves (Viernes a Domingo: Descanso Total)</span>
        </div>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {WEEK_SCHEME.filter(d => !d.isRestDay).map((day) => {
          const isDone = !!completedDays[day.dayCode];
          return (
            <div 
              key={day.dayCode}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isDone 
                  ? 'border-emerald-500/50 bg-emerald-950/20' 
                  : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${day.badgeBg}`}>
                    {day.dayName}
                  </span>
                  {isDone && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 size={14} /> Listo
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white line-clamp-1">{day.title}</h4>

                {/* Lista de ejercicios principales */}
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {day.exercises.map((ex, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bloque destacado de Cardio LISS al final */}
              <div className="pt-3 border-t border-slate-700/60 space-y-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 flex items-center gap-2.5">
                  <Flame size={18} className="text-amber-400 shrink-0 animate-pulse" />
                  <div className="text-[11px]">
                    <span className="font-bold text-amber-300 block">Cierre Cardio LISS</span>
                    <span className="text-slate-400">{day.cardioLiss}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isDone ? "primary" : "outline"}
                  onClick={() => toggleDayCompleted(day.dayCode)}
                  leftIcon={isDone ? <CheckCircle2 size={14} /> : <PlayCircle size={14} />}
                  className={`w-full rounded-xl text-xs gap-2 ${
                    isDone ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-700 text-slate-300 hover:bg-slate-700"
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
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-700 text-slate-300 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">🔒 Viernes, Sábado y Domingo: Descanso Total Obligatorio</h4>
            <p className="text-xs text-slate-400">Permite la supercompensación muscular y regeneración del sistema nervioso. 3L de agua + 5g creatina.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-slate-700 text-slate-300 border border-slate-600 whitespace-nowrap">
          Recuperación Activa
        </span>
      </div>
    </div>
  );
}
