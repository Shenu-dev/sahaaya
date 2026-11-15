import React, { useState } from 'react';
import { Pill, Plus, Clock, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { useAuth } from '../context/AuthContext';
import { MEDICATION_FORMS } from '../lib/constants';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function MedicationsPage() {
  const { profile } = useAuth();
  const { medications, addMedication, elderlyProfile } = useCareCircle();

  const [addModalOpen, setAddModalOpen] = useState(false);
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
    await addMedication({
      name,
      dosage,
      form,
      instructions,
      scheduledTime,
    });
    setIsSubmitting(false);
    setAddModalOpen(false);

    // Reset Form
    setName('');
    setDosage('');
    setForm('tablet');
    setInstructions('');
    setScheduledTime('08:00:00');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Prescriptions & Regimen</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Medications for {elderlyProfile?.full_name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Preserved history: active medications with dose history are archived rather than deleted.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setAddModalOpen(true)}
        >
          Add Medication
        </Button>
      </div>

      {/* Medication List */}
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
                    <span>{med.scheduled_time || 'Daily 08:00 AM'}</span>
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
              <span className="text-teal-700 font-medium">Daily Dosing</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Medication"
        subtitle={`Prescribe a new medication for ${elderlyProfile?.full_name}.`}
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
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500"
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
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500"
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
    </div>
  );
}
