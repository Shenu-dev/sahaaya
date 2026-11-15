import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isElderly = false,
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium gap-2 transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm border border-teal-700/80 active:bg-teal-800',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/90 active:bg-slate-300',
    outline: 'border border-teal-600 text-teal-700 hover:bg-teal-50/80 bg-transparent active:bg-teal-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700/80 active:bg-red-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent active:bg-slate-200',
    // Specially engineered for elderly accessibility: maximum contrast, high readability
    'elderly-action': 'bg-teal-700 text-white hover:bg-teal-800 text-xl font-bold shadow-elderly-action border-2 border-teal-900 touch-target-elderly px-8 py-4',
    'elderly-skip': 'bg-amber-100 text-amber-900 hover:bg-amber-200 text-lg font-bold border-2 border-amber-300 touch-target-elderly px-6 py-4',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[38px]',
    md: 'text-sm px-4.5 py-2.5 min-h-[44px]',
    lg: 'text-sm sm:text-base font-semibold px-5.5 py-2.5 min-h-[48px]',
    xl: 'text-base sm:text-lg font-bold px-7 py-3.5 min-h-[56px]',
  };

  const selectedSize = isElderly ? (variant === 'elderly-action' ? '' : sizes.xl) : sizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${selectedSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4.5 h-4.5 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
