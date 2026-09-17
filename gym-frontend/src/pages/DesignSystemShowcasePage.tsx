import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';
import ProgressBar from '../components/ui/ProgressBar';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import {
  Flame,
  Activity,
  Dumbbell,
  Droplet,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  Search,
  Lock,
} from 'lucide-react';

export const DesignSystemShowcasePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-slate-50 border border-slate-200 p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2">
            <Badge variant="energy" icon={<Zap className="w-3.5 h-3.5" />}>
              Official Design Tokens
            </Badge>
            <Badge variant="outline">v2.0 Light — Vitality Green</Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
            GymApp <span className="text-gradient-emerald">Design System</span>
          </h1>
          <p className="text-slate-500 max-w-2xl text-sm sm:text-base">
            Guía de componentes semánticos, tokens de color, métricas de alto rendimiento y micro-interacciones restringidas por el guardián de tema <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-xs">gym-theme-guardian</code>.
          </p>
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-emerald-600 rounded-sm" />
          <h2 className="text-2xl font-extrabold uppercase text-slate-900">1. Paleta de Tokens Visuales</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="h-16 w-full rounded-xl bg-emerald-600 shadow-glow-emerald flex items-end p-2">
              <span className="text-white font-black text-xs uppercase">Primary Emerald</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase">Emerald 600 (#059669)</p>
              <p className="text-[11px] text-slate-500">Marca "Vitality Green", CTAs, links activos</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="h-16 w-full rounded-xl bg-orange-600 shadow-glow-orange flex items-end p-2">
              <span className="text-white font-black text-xs uppercase">Secondary Orange</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase">Orange 600 (#ea580c)</p>
              <p className="text-[11px] text-slate-500">Acento secundario, uso puntual</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="h-16 w-full rounded-xl bg-rose-500 shadow-glow-rose flex items-end p-2">
              <span className="text-white font-black text-xs uppercase">Metric Rose</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase">Rose 500 (#f43f5e)</p>
              <p className="text-[11px] text-slate-500">Grasa corporal, calorías</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="h-16 w-full rounded-xl bg-amber-500 shadow-glow-amber flex items-end p-2">
              <span className="text-slate-950 font-black text-xs uppercase">Warning Amber</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase">Amber 500 (#f59e0b)</p>
              <p className="text-[11px] text-slate-500">Solo advertencias — nunca color de marca</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Metric Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-rose-500 rounded-sm" />
          <h2 className="text-2xl font-extrabold uppercase text-slate-900">2. Métricas de Rendimiento</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Calorías Quemadas"
            value="842"
            unit="kcal"
            accentColor="rose"
            icon={<Flame className="w-6 h-6" />}
            trend={{ value: '+15%', isPositive: true, label: 'vs ayer' }}
            subtitle="Meta diaria: 1000 kcal"
          />

          <MetricCard
            title="Volumen Levantado"
            value="4,250"
            unit="kg"
            accentColor="orange"
            icon={<Dumbbell className="w-6 h-6" />}
            trend={{ value: '+8.2%', isPositive: true, label: 'esta semana' }}
            subtitle="Rutina: Fuerza Hipertrofia"
          />

          <MetricCard
            title="Hidratación Diaria"
            value="2.8"
            unit="L"
            accentColor="emerald"
            icon={<Droplet className="w-6 h-6" />}
            trend={{ value: '100%', isPositive: true, label: 'cumplido' }}
            subtitle="Meta alcanzada"
          />

          <MetricCard
            title="Asistencia Mensual"
            value="18"
            unit="días"
            accentColor="orange"
            icon={<Trophy className="w-6 h-6" />}
            subtitle="Racha actual: 5 días"
          />
        </div>
      </section>

      {/* 3. Reusable Buttons & Badges */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buttons */}
        <Card variant="glass" className="space-y-4">
          <CardHeader>
            <CardTitle>Botones de Acción</CardTitle>
            <CardDescription>Variantes de botones con efectos glow y micro-interacciones hover/active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" leftIcon={<Zap className="w-4 h-4" />}>
                Primary Energy
              </Button>
              <Button variant="secondary">Secondary Dark</Button>
              <Button variant="outline" leftIcon={<Sparkles className="w-4 h-4" />}>
                Outline Glow
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="danger" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                Eliminar Rutina
              </Button>
              <Button variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Completar Serie
              </Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="sm">
                Small CTA
              </Button>
              <Button variant="primary" size="md">
                Medium CTA
              </Button>
              <Button variant="primary" size="lg">
                Large CTA
              </Button>
              <Button variant="primary" isLoading>
                Cargando...
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges & Status Indicators */}
        <Card variant="glass" className="space-y-4">
          <CardHeader>
            <CardTitle>Insignias y Estados</CardTitle>
            <CardDescription>Badges semánticos para etiquetas de nivel, rutinas y asistencia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-slate-500">Variantes de Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="energy" icon={<Flame className="w-3 h-3" />}>
                  Hipertrofia
                </Badge>
                <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                  Completado
                </Badge>
                <Badge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>
                  Pago Pendiente
                </Badge>
                <Badge variant="warning" icon={<Activity className="w-3 h-3" />}>
                  En Progreso
                </Badge>
                <Badge variant="neutral">Principiante</Badge>
                <Badge variant="outline">Crossfit</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-slate-500">Barras de Progreso</p>
              <ProgressBar label="Progreso del Objetivo de Peso" value={78} color="orange" />
              <ProgressBar label="Cumplimiento Proteico Diaria" value={92} color="emerald" />
              <ProgressBar label="Límite Calorías Quemadas" value={45} color="rose" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Form Fields & Modals */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Campos de Formulario</CardTitle>
            <CardDescription>Entradas claras con bordes de foco emerald.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Buscar Alumno o Rutina"
              placeholder="Ej. Juan Pérez / Espalda & Biceps..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Input
              label="Contraseña de Acceso"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />
            <Input
              label="Campo con Error de Validación"
              placeholder="Valor inválido..."
              error="El valor debe ser mayor a 0 kg."
            />
            <TextArea
              label="Observaciones Técnicas del Entrenador"
              placeholder="Escribe recomendaciones para la ejecución del ejercicio..."
            />
          </CardContent>
        </Card>

        {/* Interactive Modal Preview */}
        <Card variant="glass" className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Modales e Interacciones</CardTitle>
              <CardDescription>Ventanas emergentes con overlay difuminado (backdrop blur).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Haz clic en el botón a continuación para abrir la demostración interactiva del modal con los tokens de diseño aplicados.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Abrir Modal de Ejemplo
              </Button>
            </CardContent>
          </div>
          <CardFooter>
            <span className="text-xs text-slate-500">
              Cumple al 100% las restricciones del guardián del tema.
            </span>
          </CardFooter>
        </Card>
      </section>

      {/* Sample Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Sesión de Entrenamiento"
        subtitle="Completa las métricas ejecutadas durante el día"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Guardar Sesión
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Duración (minutos)" placeholder="60" />
          <Input label="Calorías Estimadas" placeholder="450" />
          <TextArea
            label="Notas de la Sesión"
            placeholder="Intensidad alta, buena técnica en press de banca..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default DesignSystemShowcasePage;
