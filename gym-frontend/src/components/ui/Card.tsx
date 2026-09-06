import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'outline';
  glow?: 'none' | 'amber' | 'rose' | 'emerald';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  glow = 'none',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200 shadow-industrial rounded-2xl p-6',
    glass: 'glass-panel rounded-2xl p-6',
    interactive:
      'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-0.5',
    outline: 'bg-transparent border border-slate-200 rounded-2xl p-6',
  };

  const glowStyles = {
    none: '',
    amber: 'glow-amber-hover',
    rose: 'glow-rose-hover',
    emerald: 'glow-emerald-hover',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3
    className={`font-display text-xl font-bold uppercase tracking-tight text-slate-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs text-slate-500 font-medium ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => <div className={`${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`flex items-center pt-4 mt-4 border-t border-slate-100 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
