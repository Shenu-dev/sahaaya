import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  isElderly = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transform transition-all duration-200 animate-in fade-in zoom-in-95`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`flex items-start justify-between border-b border-slate-100 ${isElderly ? 'p-6 sm:p-8 bg-teal-50/60' : 'p-6 sm:p-7'}`}>
          <div className="pr-4">
            <h3 className={`font-bold text-slate-900 tracking-tight ${isElderly ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`mt-1.5 text-slate-600 ${isElderly ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={isElderly ? 'p-6 sm:p-8' : 'p-6 sm:p-7'}>
          {children}
        </div>
      </div>
    </div>
  );
}
