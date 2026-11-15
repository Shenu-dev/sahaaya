import React from 'react';

export default function Card({
  children,
  variant = 'default',
  className = '',
  isElderly = false,
  highlight = false,
  onClick,
  ...props
}) {
  const variantStyles = {
    default: 'bg-white border-slate-200/90 text-slate-900',
    lavender: 'bg-bento-lavender border-bento-lavender-border text-slate-900',
    mint: 'bg-bento-mint border-bento-mint-border text-slate-900',
    peach: 'bg-bento-peach border-bento-peach-border text-slate-900',
    cornflower: 'bg-bento-cornflower border-bento-cornflower-dark text-white',
    glass: 'bg-white/85 backdrop-blur-md border-white/60 text-slate-900 shadow-card',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border transition-all duration-200 ${variantStyles[variant] || variantStyles.default} ${
        highlight ? 'ring-3 ring-bento-lime/40 border-slate-400' : ''
      } ${
        isElderly ? 'p-6 sm:p-8 shadow-card' : 'p-6 sm:p-7 shadow-subtle'
      } ${onClick ? 'cursor-pointer hover:shadow-card hover:scale-[1.005]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
