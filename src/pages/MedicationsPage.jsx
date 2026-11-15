import React, { useState } from 'react';
import { Plus, Clock, Archive, Pill } from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { useAuth } from '../context/AuthContext';
import { MEDICATION_FORMS } from '../lib/constants';
import { formatTimeTo12Hour } from '../lib/dateUtils';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function MedicationsPage() {
  const { profile } = useAuth();
  const { medications, addMedication, archiveMedication, elderlyProfile, canModifyDoses, isReadOnly } = useCareCircle();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('tablet');
  const [instructions, setInstructions] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateMedication = async (e) => {
    e.preventDefault();
    if (!name || !dosage) return;

    setIsSubmitting(true);
    try {
      await addMedication({
        name,
        dosage,
        form,
        instructions,
        scheduledTime: scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime,
      });
      setAddModalOpen(false);

      // Reset Form
      setName('');
      setDosage('');
      setForm('tablet');
      setInstructions('');
      setScheduledTime('08:00:00');
    } catch (err) {
      console.error('Error adding medication:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Page Header with Real Medication Visual */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white p-7 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/90 shadow-subtle shrink-0 hidden sm:block">
            <img 
              src="/images/photo-1587854692152-cbe660dbde88.avif" 
              alt="Prescription capsules" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Prescriptions & Regimen</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
              Medications for {elderlyProfile?.full_name || 'Senior'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Preserved history: active medications with dose history are archived rather than deleted.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canModifyDoses && (
            <Button
              variant="electric"
              size="md"
              icon={Plus}
              onClick={() => setAddModalOpen(true)}
              className="text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              Add Medication
            </Button>
          )}
          {isReadOnly && (
            <Badge variant="warning" size="md">
              Read-Only
            </Badge>
          )}
        </div>
      </div>

      {/* Medication List or Empty State */}
      {medications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
            <Pill className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Prescriptions Recorded</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Prescribe medications, set dosage routines, and instructions for {elderlyProfile?.full_name || 'Senior'}.
          </p>
          {canModifyDoses && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setAddModalOpen(true)}
            >
              Add First Medication
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med) => (
            <Card key={med.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                    <span className="text-sm font-semibold text-teal-700">{med.dosage}</span>
                  </div>
                  <Badge variant={med.is_active ? 'success' : 'default'} size="sm">
                    {med.is_active ? 'Active' : 'Archived'}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Form:</span>
                    <span className="font-semibold capitalize text-slate-700">{med.form}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Schedule:</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{formatTimeTo12Hour(med.scheduled_time)} Daily</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-700 block mb-0.5">Instructions:</span>
                  {med.instructions || 'Take as advised with water.'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Started: {med.start_date || 'Ongoing'}</span>
                {med.is_active && canModifyDoses ? (
                  <button
                    type="button"
                    onClick={() => setArchiveTarget(med)}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    title="Archive this medication"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">
                    {med.is_active ? 'Daily Dosing' : 'Archived'}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Medication"
        subtitle={`Prescribe a new medication for ${elderlyProfile?.full_name || 'Senior'}.`}
      >
        <form onSubmit={handleCreateMedication} className="space-y-4">
          <Input
            label="Medication Name"
            placeholder="e.g. Amlodipine Besylate"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dosage"
              placeholder="e.g. 5 mg, 500 mg, 10 ml"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Form <span className="text-red-500">*</span>
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              >
                {MEDICATION_FORMS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Daily Scheduled Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <Input
            label="Instructions for Senior"
            placeholder="e.g. Take with warm water 30 minutes after breakfast"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Medication
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft-delete Medication Archiving Dialog (FUNC-MED-08) */}
      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={async () => {
          if (archiveTarget) {
            setIsArchiving(true);
            await archiveMedication(archiveTarget.id);
            setIsArchiving(false);
            setArchiveTarget(null);
          }
        }}
        title="Archive Medication"
        message={`Are you sure you want to archive ${archiveTarget?.name}? Its dose schedule and clinical history will be preserved, but no new daily doses will be generated.`}
        confirmLabel="Archive Prescription"
        isDestructive={true}
        isLoading={isArchiving}
      />
    </div>
  );
}
