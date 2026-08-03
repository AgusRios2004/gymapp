import React from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral' | 'energy' | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow-sm',
  danger: 'bg-rose-950/80 text-rose-400 border-rose-800/60 shadow-sm',
  warning: 'bg-amber-950/80 text-amber-400 border-amber-800/60 shadow-sm',
  energy: 'bg-orange-950/80 text-orange-400 border-orange-800/60 shadow-sm',
  neutral: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60 shadow-sm',
  outline: 'bg-transparent text-zinc-400 border-zinc-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px] gap-1 font-semibold',
  md: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase tracking-wider transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;