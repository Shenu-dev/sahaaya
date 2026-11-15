import React, { useState } from 'react';
import { Users, PlusCircle, KeyRound, Sparkles, AlertCircle, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCareCircle } from '../../context/CareCircleContext';
import Button from './Button';
import CreateCircleModal from './CreateCircleModal';

export default function NoCareCircleView() {
  const { profile, user, signInAsDemo } = useAuth();
  const { acceptInvitation } = useCareCircle();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  const displayName = profile?.full_name || user?.email || 'Care Partner';

  const handleJoinWithToken = async (e) => {
    e.preventDefault();
    if (!inviteToken.trim()) {
      setTokenError('Please enter an invitation token.');
      return;
    }

    setTokenError('');
    setIsSubmittingToken(true);

    try {
      const res = await acceptInvitation(inviteToken.trim());
      if (!res.success) {
        setTokenError(res.error || 'Failed to accept invitation. The token may be expired or already used.');
      }
    } catch (err) {
      setTokenError(err.message || 'Error accepting invitation.');
    } finally {
      setIsSubmittingToken(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-white rounded-[32px] sm:rounded-[36px] p-8 sm:p-10 border border-slate-200/90 shadow-subtle text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
          <HeartHandshake className="w-7 h-7 text-bento-lime" />
        </div>
        <span className="inline-flex items-center gap-1.5 bg-bento-mint text-emerald-950 border border-bento-mint-border text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
          Authenticated Account
        </span>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Welcome to Sahaaya, {displayName}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
          You are successfully signed in, but you are not connected to any Care Circle yet.
          To protect patient confidentiality, all healthcare records, medications, and doses are strictly isolated per Care Circle.
        </p>
      </div>

      {/* Action Cards Grid in Bento Aesthetics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Create New Care Circle (Reference Bento Lavender) */}
        <div className="bg-bento-lavender rounded-[32px] p-7 sm:p-8 border border-bento-lavender-border shadow-subtle flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <PlusCircle className="w-6 h-6 text-bento-lime" />
            </div>
            <h2 className="text-xl font-black text-slate-950">Create a Care Circle</h2>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Start a private, isolated circle for your elderly parent or loved one. You will become the primary administrator and can invite family members and caregivers.
            </p>
          </div>

          <Button
            variant="electric"
            size="lg"
            className="w-full text-xs font-bold uppercase tracking-wider shadow-sm"
            onClick={() => setCreateModalOpen(true)}
          >
            + Create New Care Circle
          </Button>
        </div>

        {/* Card 2: Join via Invitation Token (Reference Bento Peach) */}
        <div className="bg-bento-peach rounded-[32px] p-7 sm:p-8 border border-bento-peach-border shadow-subtle flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <KeyRound className="w-6 h-6 text-bento-lime" />
            </div>
            <h2 className="text-xl font-black text-slate-950">Join an Existing Circle</h2>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Received an invitation code or token from a family member? Paste your single-use cryptographic token below to join their Care Circle.
            </p>
          </div>

          <form onSubmit={handleJoinWithToken} className="space-y-3">
            {tokenError && (
              <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tokenError}</span>
              </div>
            )}
            <input
              type="text"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              placeholder="Paste invite token here..."
              className="w-full px-4 py-3 text-xs rounded-full border border-slate-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono shadow-2xs"
            />
            <Button
              type="submit"
              variant="pill-outline"
              size="lg"
              className="w-full text-xs font-bold uppercase tracking-wider"
              isLoading={isSubmittingToken}
            >
              Join Care Circle
            </Button>
          </form>
        </div>
      </div>

      {/* Demo Persona Switcher Banner for Evaluators */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-900 shrink-0" />
          <span className="font-medium">Evaluating the platform? You can switch to the interactive demo baseline at any time.</span>
        </div>
        <button
          type="button"
          onClick={() => signInAsDemo('elderly')}
          className="font-black text-slate-950 hover:underline shrink-0"
        >
          Switch to Kamla Sharma (Demo) &rarr;
        </button>
      </div>

      {/* Atomic Create Care Circle Modal */}
      <CreateCircleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
