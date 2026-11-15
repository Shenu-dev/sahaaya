import React from 'react';
import { DOSE_STATUS_CONFIG } from '../../lib/constants';

export default function Badge({
  children,
  variant = 'default',
  doseStatus,
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-teal-50 text-teal-700 border border-teal-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    demo: 'bg-purple-100 text-purple-800 border border-purple-300 font-bold tracking-wide uppercase',
  };

  if (doseStatus && DOSE_STATUS_CONFIG[doseStatus]) {
    const config = DOSE_STATUS_CONFIG[doseStatus];
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizes[size]} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {children || config.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
