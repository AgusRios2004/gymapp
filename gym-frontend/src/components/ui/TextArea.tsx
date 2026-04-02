import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <textarea
          ref={ref}
          className={`
            w-full border rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 transition-colors
            min-h-[100px] resize-y
            ${error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 animate-pulse">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";