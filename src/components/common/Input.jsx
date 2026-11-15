import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  isElderly = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block mb-2 ${
            isElderly ? 'text-lg text-slate-900 font-bold' : 'text-sm font-semibold text-slate-700'
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full rounded-xl border transition-colors duration-150 focus:outline-none focus:ring-3 focus:ring-teal-500/20 focus:border-teal-600 disabled:bg-slate-100 disabled:cursor-not-allowed ${
          isElderly ? 'text-lg px-4.5 py-3.5 min-h-[56px] border-slate-300' : 'text-sm px-4 py-2.5 min-h-[44px] border-slate-300'
        } ${error ? 'border-red-400 bg-red-50/30 focus:ring-red-500 focus:border-red-500' : 'bg-white'}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
