import React, { forwardRef } from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200
            min-h-[100px] resize-y focus:outline-none focus:ring-2
            ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-zinc-800 focus:border-amber-500 focus:ring-amber-500/30 hover:border-zinc-700'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-400 font-medium animate-pulse">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;