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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200 shadow-card text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto mb-2">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Authenticated Account
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Sahaaya, {displayName}
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto">
          You are successfully signed in, but you are not connected to any Care Circle yet.
          To protect patient confidentiality, all healthcare records, medications, and doses are strictly isolated per Care Circle.
        </p>
      </div>

      {/* Action Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Create New Care Circle */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-subtle flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Create a Care Circle</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Start a private, isolated circle for your elderly parent or loved one. You will become the primary administrator and can invite family members and caregivers.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-md shadow-teal-600/20"
            onClick={() => setCreateModalOpen(true)}
          >
            + Create New Care Circle
          </Button>
        </div>

        {/* Card 2: Join via Invitation Token */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-subtle flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Join an Existing Circle</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Received an invitation code or token from a family member? Paste your single-use cryptographic token below to join their Care Circle.
            </p>
          </div>

          <form onSubmit={handleJoinWithToken} className="space-y-3">
            {tokenError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tokenError}</span>
              </div>
            )}
            <input
              type="text"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              placeholder="Paste invite token here..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full"
              isLoading={isSubmittingToken}
            >
              Join Care Circle
            </Button>
          </form>
        </div>
      </div>

      {/* Demo Persona Switcher Banner for Evaluators */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Evaluating the platform? You can switch to the interactive demo baseline at any time.</span>
        </div>
        <button
          type="button"
          onClick={() => signInAsDemo('elderly')}
          className="font-bold text-teal-700 hover:text-teal-900 hover:underline shrink-0"
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
