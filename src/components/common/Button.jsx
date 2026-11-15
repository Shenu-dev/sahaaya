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
  pill = false,
  className = '',
  onClick,
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-3 focus-visible:ring-bento-lime/60 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm border border-teal-700/80 active:bg-teal-800',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/90 active:bg-slate-300',
    outline: 'border border-teal-600 text-teal-700 hover:bg-teal-50/80 bg-transparent active:bg-teal-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700/80 active:bg-red-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent active:bg-slate-200',
    // Reference-inspired Bento action variants
    electric: 'bg-bento-lime text-slate-950 hover:bg-bento-lime-hover font-bold shadow-sm border border-lime-400 rounded-full active:bg-lime-400',
    coral: 'bg-bento-coral text-white hover:bg-bento-coral-hover font-semibold shadow-sm border border-red-400 rounded-full active:bg-red-500',
    'pill-outline': 'border border-slate-300/90 text-slate-800 hover:bg-white bg-white/70 backdrop-blur-sm rounded-full shadow-subtle active:bg-slate-100',
    // Specially engineered for elderly accessibility: maximum contrast, high readability
    'elderly-action': 'bg-bento-lime text-slate-950 hover:bg-bento-lime-hover text-xl font-extrabold shadow-card border-2 border-slate-900 touch-target-elderly px-8 py-4 rounded-full',
    'elderly-skip': 'bg-amber-100 text-amber-900 hover:bg-amber-200 text-lg font-bold border-2 border-amber-300 touch-target-elderly px-6 py-4 rounded-full',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[38px]',
    md: 'text-sm px-4.5 py-2.5 min-h-[44px]',
    lg: 'text-sm sm:text-base font-semibold px-5.5 py-2.5 min-h-[48px]',
    xl: 'text-base sm:text-lg font-bold px-7 py-3.5 min-h-[56px]',
  };

  const selectedSize = isElderly ? (variant === 'elderly-action' ? '' : sizes.xl) : sizes[size];
  const radius = pill || variant === 'electric' || variant === 'coral' || variant === 'pill-outline' || variant.startsWith('elderly') ? 'rounded-full' : 'rounded-2xl';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${radius} ${variants[variant] || variants.primary} ${selectedSize} ${className}`}
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
