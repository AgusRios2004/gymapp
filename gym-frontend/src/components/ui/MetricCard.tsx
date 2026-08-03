import React from 'react';
import Card from './Card';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'amber' | 'rose' | 'emerald' | 'orange';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  accentColor = 'amber',
  className = '',
}) => {
  const accentStyles = {
    amber: {
      border: 'border-l-4 border-l-amber-500',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      valueText: 'text-amber-400',
    },
    rose: {
      border: 'border-l-4 border-l-rose-500',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      valueText: 'text-rose-400',
    },
    emerald: {
      border: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueText: 'text-emerald-400',
    },
    orange: {
      border: 'border-l-4 border-l-orange-500',
      iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      valueText: 'text-orange-400',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <Card
      variant="glass"
      className={`relative overflow-hidden ${style.border} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-display text-3xl font-black ${style.valueText}`}>
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-zinc-400">{unit}</span>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={`p-3 rounded-xl border ${style.iconBg} flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-zinc-400">{subtitle}</span>}
          {trend && (
            <div
              className={`inline-flex items-center gap-1 font-bold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-zinc-500 font-normal ml-0.5">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
