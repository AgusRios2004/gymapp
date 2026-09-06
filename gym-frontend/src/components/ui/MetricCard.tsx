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
  accentColor = 'emerald',
  className = '',
}) => {
  const accentStyles = {
    amber: {
      border: 'border-l-4 border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      valueText: 'text-amber-600',
    },
    rose: {
      border: 'border-l-4 border-l-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      valueText: 'text-rose-600',
    },
    emerald: {
      border: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      valueText: 'text-emerald-600',
    },
    orange: {
      border: 'border-l-4 border-l-orange-500',
      iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
      valueText: 'text-orange-600',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <Card
      variant="default"
      className={`relative overflow-hidden ${style.border} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-display text-3xl font-black ${style.valueText}`}>
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-slate-500">{unit}</span>
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
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <div
              className={`inline-flex items-center gap-1 font-bold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-slate-400 font-normal ml-0.5">
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
