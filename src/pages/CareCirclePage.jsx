import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, Copy, KeyRound, Plus } from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import CreateCircleModal from '../components/common/CreateCircleModal';

export default function CareCirclePage() {
  const { profile } = useAuth();
  const { careCircle, members, elderlyProfile, activityLogs, currentPermissions } = useCareCircle();
  const canInvite = currentPermissions === 'admin' || profile?.role === 'elderly';

  const [createCircleModalOpen, setCreateCircleModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('family');
  const [invitePermission, setInvitePermission] = useState('write');
  const [inviteRelation, setInviteRelation] = useState('Daughter');
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate Cryptographically Secure SHA-256 Invitation Token
  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsGenerating(true);

    try {
      // 1. Generate 32 bytes of cryptographically random entropy
      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);
      const rawToken = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // 2. Compute SHA-256 hash using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(rawToken);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // 3. Persist cryptographically hashed invitation to database (FUNC-HIGH-02)
      if (isSupabaseConfigured && supabase && profile?.id && careCircle?.id && !careCircle?.is_demo) {
        const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
        const { error: inviteError } = await supabase.from('care_circle_invitations').insert({
          care_circle_id: careCircle.id,
          invited_email: inviteEmail.trim().toLowerCase(),
          token_hash: tokenHash,
          member_role: inviteRole,
          permissions: invitePermission,
          relationship_label: inviteRelation,
          expires_at: expiresAt,
          created_by: profile.id,
        });

        if (inviteError) throw inviteError;
      }

      // 4. Construct shareable link with RAW token (DB stores ONLY tokenHash)
      const link = `${window.location.origin}/join?token=${rawToken}`;
      setGeneratedInviteLink(link);
    } catch (err) {
      console.error('Error generating secure token:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-subtle">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Unified Care Ecosystem</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            {careCircle?.name || 'Care Circle'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Central patient: <span className="font-bold text-slate-800">{elderlyProfile?.full_name}</span>. Access strictly governed by PostgreSQL Row Level Security.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={Plus}
            onClick={() => setCreateCircleModalOpen(true)}
          >
            New Circle
          </Button>

          {canInvite ? (
            <Button
              variant="primary"
              size="md"
              icon={UserPlus}
              onClick={() => {
                setGeneratedInviteLink('');
                setInviteModalOpen(true);
              }}
            >
              Invite Member
            </Button>
          ) : (
            <Badge variant="warning" size="md">
              Admin Required to Invite
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Members List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Connected Circle Members ({members.length})</span>
          </h2>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm">
                    {member.full_name?.substring(0, 2).toUpperCase() || 'ME'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{member.full_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{member.relationship_label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant={member.role === 'elderly' ? 'primary' : 'default'} size="sm">
                    {member.role === 'elderly' ? 'Elderly Individual' : member.role === 'family' ? 'Family Member' : 'Caregiver'}
                  </Badge>
                  <Badge variant={member.permissions === 'admin' ? 'admin' : member.permissions === 'write' ? 'info' : 'warning'} size="sm">
                    {member.permissions === 'admin' ? 'Admin' : member.permissions === 'write' ? 'Write' : 'Read Only'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Permission Matrix & Security Notice */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Permission Matrix</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Elderly Individual (Owner)</span>
                <p>Full control over medical profile, emergency contacts, today's schedule confirmation, and invitations.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Family Admin / Write</span>
                <p>Manage prescriptions, schedules, record medication doses, and schedule doctor visits.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Caregiver</span>
                <p>Record medication administration, add shift clinical observations, and view schedule.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Read-Only Member</span>
                <p className="text-slate-500">Can view adherence reports and activity. <span className="font-bold text-red-600">Forbidden from modifying doses.</span></p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite to Care Circle"
        subtitle={`Generate a cryptographically secure, single-use invite link for ${careCircle?.name}.`}
      >
        {!generatedInviteLink ? (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <Input
              label="Invited Email Address"
              type="email"
              placeholder="e.g. daughter@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              helperText="The invitation can strictly only be accepted by an account matching this email address."
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Member Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                >
                  <option value="family">Family Member</option>
                  <option value="caregiver">Caregiver / Nurse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Permission Level
                </label>
                <select
                  value={invitePermission}
                  onChange={(e) => setInvitePermission(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                >
                  <option value="write">Write & Administer</option>
                  <option value="read">Read Only (Observer)</option>
                </select>
              </div>
            </div>

            <Input
              label="Relationship Label"
              placeholder="e.g. Daughter, Visiting Nurse, Grandson"
              value={inviteRelation}
              onChange={(e) => setInviteRelation(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isGenerating}>
                Generate Secure Token
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900">Cryptographic Invitation Generated</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This single-use link expires in 72 hours. Only <span className="font-bold text-slate-800">{inviteEmail}</span> can accept it.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-all select-all text-left">
              {generatedInviteLink}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleCopyLink}
                icon={copied ? Check : Copy}
              >
                {copied ? 'Link Copied to Clipboard!' : 'Copy Invitation Link'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Care Circle Modal (FUNC-HIGH-06) */}
      <CreateCircleModal
        isOpen={createCircleModalOpen}
        onClose={() => setCreateCircleModalOpen(false)}
      />
    </div>
  );
}
