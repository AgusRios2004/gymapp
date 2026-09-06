import React from 'react';

export interface SkeletonProps {
  className?: string;
  /** Radio de borde — 'text' para líneas de texto, 'full' para avatares/círculos, 'card' para bloques. */
  shape?: 'text' | 'full' | 'card';
}

/**
 * Placeholder de carga genérico. Usar mientras se espera una respuesta de TanStack Query
 * en vez de dejar la vista en blanco. Ver DESIGN_SYSTEM.md.
 *
 * Uso:
 *   <Skeleton className="h-4 w-32" shape="text" />
 *   <Skeleton className="h-10 w-10" shape="full" />
 *   <Skeleton className="h-24 w-full" shape="card" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', shape = 'card' }) => {
  const radius = {
    text: 'rounded',
    full: 'rounded-full',
    card: 'rounded-xl',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${radius[shape]} ${className}`}
      aria-hidden="true"
    />
  );
};

/** Fila de skeleton lista para tablas: ícono/avatar + dos líneas de texto. */
export const SkeletonRow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 py-3 ${className}`}>
    <Skeleton className="h-9 w-9 shrink-0" shape="full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-1/3" shape="text" />
      <Skeleton className="h-3 w-1/2" shape="text" />
    </div>
  </div>
);

export default Skeleton;
