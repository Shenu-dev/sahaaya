import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

export default function AppointmentsPage() {
  const { appointments, addAppointment, elderlyProfile } = useCareCircle();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName || !clinic || !apptTime) return;

    setIsSubmitting(true);
    await addAppointment({
      doctorName,
      specialty: specialty || 'General Physician',
      clinicOrHospital: clinic,
      appointmentTime: apptTime,
      notes,
    });
    setIsSubmitting(false);
    setAddModalOpen(false);

    setDoctorName('');
    setSpecialty('');
    setClinic('');
    setApptTime('');
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Clinical Consultations</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Doctor Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Scheduled visits and preparation instructions for {elderlyProfile?.full_name}.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setAddModalOpen(true)}
        >
          Schedule Appointment
        </Button>
      </div>

      {/* Appointment Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {appointments.map((appt) => (
          <Card key={appt.id} className="space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{appt.doctor_name}</h3>
                <span className="text-xs font-semibold text-teal-700">{appt.specialty}</span>
              </div>
              <Badge variant="info" size="sm">
                {appt.status || 'Upcoming'}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">{appt.clinic_or_hospital}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-teal-800">
                  {new Date(appt.appointment_time).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {appt.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700 block mb-0.5">Instructions & Preparation:</span>
                {appt.notes}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Schedule Doctor Visit"
        subtitle={`Book an appointment for ${elderlyProfile?.full_name}.`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Doctor Name"
            placeholder="e.g. Dr. Rajiv Verma"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
          />
          <Input
            label="Specialty / Department"
            placeholder="e.g. Cardiology, Ophthalmology"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
          <Input
            label="Hospital or Clinic"
            placeholder="e.g. Apollo Specialty Clinic"
            value={clinic}
            onChange={(e) => setClinic(e.target.value)}
            required
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={apptTime}
            onChange={(e) => setApptTime(e.target.value)}
            required
          />
          <Input
            label="Preparation Notes"
            placeholder="e.g. Fasting 10 hours, bring ECG logs"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
