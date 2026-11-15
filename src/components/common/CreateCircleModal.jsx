import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { HeartHandshake, AlertCircle } from 'lucide-react';
import { useCareCircle } from '../../context/CareCircleContext';

export default function CreateCircleModal({ isOpen, onClose }) {
  const { createCareCircle } = useCareCircle();
  const [circleName, setCircleName] = useState('');
  const [elderlyName, setElderlyName] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!circleName || !elderlyName || !emergencyName || !emergencyPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await createCareCircle({
        circleName,
        elderlyName,
        emergencyName,
        emergencyPhone,
        doctorName,
        doctorPhone,
        allergies,
        medicalConditions,
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to create Care Circle.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Care Circle"
      subtitle="Initialize an atomic Care Circle for your loved one with strict PostgreSQL Row Level Security."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Care Circle Name"
          placeholder="e.g. Gupta Family Care Circle"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
          required
        />

        <Input
          label="Elderly Patient Full Name"
          placeholder="e.g. Maya Devi"
          value={elderlyName}
          onChange={(e) => setElderlyName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Emergency Contact Name"
            placeholder="e.g. Aarav Gupta"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
            required
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="e.g. +91 98765 43210"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Attending Doctor"
            placeholder="e.g. Dr. Rajiv Verma (Cardiologist)"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
          <Input
            label="Doctor Direct Phone Number"
            placeholder="e.g. +91 98111 22334"
            value={doctorPhone}
            onChange={(e) => setDoctorPhone(e.target.value)}
          />
        </div>

        <Input
          label="Known Allergies"
          placeholder="e.g. Penicillin, Aspirin"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />

        <Input
          label="Diagnosed Medical Conditions"
          placeholder="e.g. Hypertension, Type-2 Diabetes"
          value={medicalConditions}
          onChange={(e) => setMedicalConditions(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} icon={HeartHandshake}>
            Create Care Circle
          </Button>
        </div>
      </form>
    </Modal>
  );
}
