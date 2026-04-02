import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string; // Aquí recibiremos el mensaje de error
}

// forwardRef permite que este componente reciba la "ref" de react-hook-form
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref} // Pasamos la referencia al input real
          className={`
            w-full border rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 transition-colors
            ${error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' // Estilo de Error
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' // Estilo Normal
            }
            ${className}
          `}
          {...props} // Pasamos el resto de props (type, placeholder, onChange, etc.)
        />
        {/* Renderizado condicional del error */}
        {error && (
          <p className="text-xs text-red-500 animate-pulse">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input"; // Buena práctica para debugging en React