import React, { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { formatDateTimeToReadable } from '../lib/dateUtils';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointmentStatus, elderlyProfile, canModifyDoses, isReadOnly } = useCareCircle();

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
    try {
      await addAppointment({
        doctorName,
        specialty: specialty || 'General Physician',
        clinicOrHospital: clinic,
        appointmentTime: apptTime,
        notes,
      });
      setAddModalOpen(false);

      setDoctorName('');
      setSpecialty('');
      setClinic('');
      setApptTime('');
      setNotes('');
    } catch (err) {
      console.error('Error adding appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white p-7 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-subtle">
        <div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Clinical Consultations</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1.5 tracking-tight">
            Doctor Appointments
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Scheduled visits and preparation instructions for {elderlyProfile?.full_name || 'Senior'}.
          </p>
        </div>

        {canModifyDoses && (
          <Button
            variant="electric"
            size="md"
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
            className="text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            Schedule Visit
          </Button>
        )}
        {isReadOnly && (
          <Badge variant="warning" size="md">
            Read-Only (Scheduling Restricted)
          </Badge>
        )}
      </div>

      {/* Appointment Grid or Empty State */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Doctor Appointments Scheduled</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Keep track of doctor consultations, clinical checkups, and preparation instructions for {elderlyProfile?.full_name || 'Senior'}.
          </p>
          {canModifyDoses && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setAddModalOpen(true)}
            >
              Schedule First Visit
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const isCompleted = appt.status === 'completed';
            const isCancelled = appt.status === 'cancelled';
            const badgeVariant = isCompleted ? 'success' : isCancelled ? 'default' : 'info';

            return (
              <Card key={appt.id} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{appt.doctor_name}</h3>
                      <span className="text-xs font-semibold text-teal-700">{appt.specialty}</span>
                    </div>
                    <Badge variant={badgeVariant} size="sm">
                      {(appt.status || 'Upcoming').toUpperCase()}
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
                        {formatDateTimeToReadable(appt.appointment_time)}
                      </span>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <span className="font-bold text-slate-700 block mb-0.5">Instructions & Preparation:</span>
                      {appt.notes}
                    </div>
                  )}
                </div>

                {canModifyDoses && appt.status === 'upcoming' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                      className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors px-2 py-1"
                    >
                      Cancel Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Schedule Doctor Visit"
        subtitle={`Book an appointment for ${elderlyProfile?.full_name || 'Senior'}.`}
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
