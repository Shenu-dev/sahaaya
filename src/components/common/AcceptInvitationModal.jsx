import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCareCircle } from '../../context/CareCircleContext';

export default function AcceptInvitationModal({ isOpen, onClose, token }) {
  const { acceptInvitation } = useCareCircle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAccept = async () => {
    if (!token) return;
    setError('');
    setIsSubmitting(true);

    try {
      const res = await acceptInvitation(token);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          // Clear query param from address bar
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 1800);
      } else {
        setError(res.error || 'Failed to accept invitation. It may be expired or already used.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while accepting the invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Care Circle"
      subtitle="You have received a secure cryptographic invitation to join a Saarthi Care Circle."
    >
      <div className="space-y-5 py-2">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Welcome to the Care Circle!</h4>
            <p className="text-xs text-slate-600">
              Your membership has been verified and registered. Opening your dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-teal-50 border border-teal-100 text-xs text-teal-900">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold block text-sm">Secure Invitation Token Detected</span>
                <span className="text-teal-700 font-medium">
                  Connecting your account grants you coordinated access to schedule, dose history, and alerts.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Dismiss
              </Button>
              <Button variant="primary" onClick={handleAccept} isLoading={isSubmitting}>
                Accept & Join Circle
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
