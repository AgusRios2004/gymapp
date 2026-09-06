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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-white text-slate-900 placeholder-slate-400 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200
            min-h-[100px] resize-y focus:outline-none focus:ring-2
            ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 hover:border-slate-300'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
