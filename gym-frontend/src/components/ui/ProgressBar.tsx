import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'amber' | 'emerald' | 'rose' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'amber',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const gradients = {
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-glow-amber',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald',
    rose: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-glow-rose',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-glow-orange',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-bold uppercase tracking-wider text-zinc-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-mono font-bold text-amber-400">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-zinc-800/90 rounded-full overflow-hidden p-0.5 border border-zinc-700/50 ${heights[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${gradients[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
