import React from 'react';

export default function Card({
  children,
  className = '',
  isElderly = false,
  highlight = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all duration-150 ${
        highlight ? 'border-teal-400 ring-3 ring-teal-500/10' : 'border-slate-200'
      } ${
        isElderly ? 'p-6 sm:p-8 shadow-card border-slate-300' : 'p-6 shadow-subtle'
      } ${onClick ? 'cursor-pointer hover:border-teal-300 hover:shadow-card' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
