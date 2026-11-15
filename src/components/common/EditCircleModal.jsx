import React, { useState, useEffect } from 'react';
import { Settings2, Phone, AlertCircle, HeartHandshake } from 'lucide-react';
import { useCareCircle } from '../../context/CareCircleContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

/**
 * Edit Care Circle Modal
 * Allows updating Circle Name, Senior details, Emergency Contacts,
 * and Primary Attending Doctor (Name & Phone Number).
 */
export default function EditCircleModal({ isOpen, onClose }) {
  const { careCircle, elderlyProfile, updateCareCircle } = useCareCircle();

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
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCircleName(careCircle?.name || '');
      setElderlyName(elderlyProfile?.full_name || '');
      setEmergencyName(elderlyProfile?.emergency_contact_name || '');
      setEmergencyPhone(elderlyProfile?.emergency_contact_phone || '');
      setDoctorName(elderlyProfile?.primary_doctor_name || '');
      setDoctorPhone(elderlyProfile?.primary_doctor_phone || '');
      setAllergies(elderlyProfile?.allergies || '');
      setMedicalConditions(elderlyProfile?.medical_conditions || '');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, careCircle, elderlyProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!circleName || !elderlyName || !emergencyName || !emergencyPhone) {
      setError('Circle name, patient name, and emergency contact details are required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await updateCareCircle({
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
        setSuccessMsg('Care Circle and Doctor contacts updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to update Care Circle.');
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
      title="Edit Care Circle & Doctor Details"
      subtitle="Update Care Circle metadata, senior profile, emergency contacts, and attending doctor phone."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <Input
          label="Care Circle Name"
          placeholder="e.g. Sharma Family Care Circle"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
          required
        />

        <Input
          label="Elderly Patient Full Name"
          placeholder="e.g. Kamla Sharma"
          value={elderlyName}
          onChange={(e) => setElderlyName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Emergency Contact Name"
            placeholder="e.g. Rohan Sharma"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
            required
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="e.g. +91 98765 43211"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            required
          />
        </div>

        {/* Primary Attending Doctor Section */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Attending Doctor Direct Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Doctor Name & Specialty"
              placeholder="e.g. Dr. Rajiv Verma (Cardiologist)"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
            <Input
              label="Doctor Direct Phone Number"
              placeholder="e.g. +91 98111 22334"
              value={doctorPhone}
              onChange={(e) => setDoctorPhone(e.target.value)}
              helperText="Dialable 1-tap call button for senior and family."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Known Allergies"
            placeholder="e.g. Penicillin, Aspirin"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
          <Input
            label="Medical Conditions"
            placeholder="e.g. Hypertension, Type-2 Diabetes"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} icon={Settings2}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
