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
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  energy: 'bg-orange-50 text-orange-700 border-orange-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  outline: 'bg-transparent text-slate-500 border-slate-300',
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
