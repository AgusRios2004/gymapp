import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30 hover:shadow-emerald-600/30',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200',
    outline:
      'border border-emerald-600/60 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/80 hover:border-emerald-600 hover:text-emerald-800',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-500/30',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    success:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/30',
    warning:
      'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-400/30',
  };

  const sizes = {
    sm: 'h-11 px-4 text-xs gap-1.5 min-w-[100px]',
    md: 'h-11 px-6 py-2.5 text-sm gap-2 min-w-[140px]',
    lg: 'h-12 px-8 py-3.5 text-base gap-2.5 min-w-[180px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}

      <span className="inline-flex items-center gap-[inherit]">{children}</span>

      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
