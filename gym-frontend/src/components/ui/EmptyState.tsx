import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'empty' | 'error';
  className?: string;
}

/**
 * Estado estándar para listas/vistas sin datos o con error de carga.
 * Ver DESIGN_SYSTEM.md — todo componente debe tener Loading/Empty/Error state (gym-frontend/GEMINI.md 3.1).
 *
 * Uso:
 *   <EmptyState title="No hay clientes todavía" description="Creá el primero para empezar." action={<Button>Nuevo cliente</Button>} />
 *   <EmptyState variant="error" title="No pudimos cargar los clientes" description={error.message} />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'empty',
  className = '',
}) => {
  const iconBg =
    variant === 'error'
      ? 'bg-rose-50 text-rose-500 border-rose-200'
      : 'bg-slate-100 text-slate-400 border-slate-200';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {icon && (
        <div
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${iconBg}`}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
