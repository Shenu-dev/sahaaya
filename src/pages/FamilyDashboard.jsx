import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Plus, 
  Users, 
  Pill, 
  ShieldAlert, 
  UserCheck, 
  Phone,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { useAuth } from '../context/AuthContext';
import { DOSE_STATUS } from '../lib/constants';
import { formatTimeTo12Hour, formatDateTimeToReadable } from '../lib/dateUtils';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import EarlyDoseModal from '../components/common/EarlyDoseModal';

export default function FamilyDashboard({ onNavigateTab }) {
  const { profile } = useAuth();
  const { 
    elderlyProfile, 
    todayDoses, 
    appointments, 
    activityLogs, 
    adherenceMetrics, 
    markDose, 
    addAppointment,
    careCircle,
    canModifyDoses,
    isReadOnly
  } = useCareCircle();

  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newApptTime, setNewApptTime] = useState('');
  const [newApptNotes, setNewApptNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Premature Dose Early Confirmation State
  const [earlyModalOpen, setEarlyModalOpen] = useState(false);
  const [earlyDoseTarget, setEarlyDoseTarget] = useState(null);
  const [earlyMinutesAhead, setEarlyMinutesAhead] = useState(0);

  // Check if any doses are missed
  const missedDoses = todayDoses.filter((d) => d.status === DOSE_STATUS.MISSED);

  const handleMarkDoseClick = async (dose, isEarlyConfirmed = false) => {
    const res = await markDose(dose.id, DOSE_STATUS.TAKEN, 'Confirmed by Family', isEarlyConfirmed);
    if (res?.needsEarlyConfirmation) {
      setEarlyDoseTarget(res.dose);
      setEarlyMinutesAhead(res.minutesAhead);
      setEarlyModalOpen(true);
    }
  };

  const handleConfirmEarlyDose = async () => {
    if (earlyDoseTarget) {
      await markDose(earlyDoseTarget.id, DOSE_STATUS.TAKEN, 'Confirmed by Family (Early Administration)', true);
      setEarlyModalOpen(false);
      setEarlyDoseTarget(null);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newDoctorName || !newApptTime || !newClinic) return;

    setIsSubmitting(true);
    await addAppointment({
      doctorName: newDoctorName,
      specialty: newSpecialty || 'General Physician',
      clinicOrHospital: newClinic,
      appointmentTime: newApptTime,
      notes: newApptNotes,
    });
    setIsSubmitting(false);
    setApptModalOpen(false);
    // Reset form
    setNewDoctorName('');
    setNewSpecialty('');
    setNewClinic('');
    setNewApptTime('');
    setNewApptNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Family Care Oversight</span>
            {careCircle?.is_demo && <Badge variant="demo" size="sm">Demo Environment</Badge>}
            {isReadOnly && <Badge variant="warning" size="sm">Read-Only Observer</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Care Dashboard for {elderlyProfile?.full_name || 'Elderly Member'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Logged in as {profile?.full_name || 'Family Member'} ({profile?.role === 'elderly' ? 'Elderly Owner' : 'Care Circle Member'})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={Calendar}
            disabled={!canModifyDoses}
            onClick={() => setApptModalOpen(true)}
          >
            Add Appointment
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Pill}
            onClick={() => onNavigateTab('medications')}
          >
            Manage Meds
          </Button>
        </div>
      </div>

      {/* Urgent Missed Dose Alert (If any) */}
      {missedDoses.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 text-red-900 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Missed Dose Alert Detected</h3>
            <p className="text-sm text-red-700">
              {missedDoses.map((d) => `${d.med_name} (Scheduled: ${formatTimeTo12Hour(d.scheduled_time)})`).join(', ')} was missed or overdue. Please check in with {elderlyProfile?.full_name}.
            </p>
          </div>
        </div>
      )}

      {/* Mathematically Rigorous Adherence & Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Due Doses Adherence Rate */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Doses Adherence</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                Eligible Doses
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-teal-700">
                {adherenceMetrics.hasDueDoses ? `${adherenceMetrics.adherenceRate}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {adherenceMetrics.hasDueDoses
                  ? `${adherenceMetrics.takenCount} of ${adherenceMetrics.dueDosesCount} due`
                  : 'No doses due yet'}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${adherenceMetrics.adherenceRate || 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Excludes {adherenceMetrics.upcomingCount} future doses
            </p>
          </div>
        </Card>

        {/* 2. Full Day Progress */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day Progress</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-600">
                {adherenceMetrics.takenCount}/{adherenceMetrics.totalCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({adherenceMetrics.dayCompletionRate}% complete)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">
            {adherenceMetrics.takenCount} taken • {adherenceMetrics.upcomingCount} remaining
          </p>
        </Card>

        {/* 3. Upcoming Today */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Upcoming</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-blue-600">
                {adherenceMetrics.upcomingCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">future doses</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Scheduled for later today</p>
        </Card>

        {/* 4. Missed & Skipped */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missed / Skipped</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold ${adherenceMetrics.missedCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                {adherenceMetrics.missedCount + adherenceMetrics.skippedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({adherenceMetrics.missedCount} missed, {adherenceMetrics.skippedCount} skipped)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-medium">
            {adherenceMetrics.missedCount > 0 ? 'Requires attention' : 'Zero unconfirmed doses'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Today's Timeline + Patient Details */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Today's Medication Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Today's Dose Timeline</h3>
                  <p className="text-xs text-slate-500">Every dose record captures who updated it and when</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">Strict Audit Trail</Badge>
            </div>

            <div className="space-y-4">
              {todayDoses.map((dose) => (
                <div
                  key={dose.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{dose.med_name}</span>
                      <Badge doseStatus={dose.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Dosage: {dose.dosage} • Scheduled: <span className="font-bold text-slate-800">{formatTimeTo12Hour(dose.scheduled_time)}</span>
                    </p>
                    {dose.recorded_at && (
                      <p className="text-xs text-slate-500">
                        Updated at: <span className="font-bold text-slate-700">{formatTimeTo12Hour(dose.recorded_at)}</span> by <span className="font-bold text-teal-800">{dose.recorded_by_name || 'Senior'}</span>
                      </p>
                    )}
                    {dose.notes && (
                      <p className="text-xs text-slate-500 italic">Notes: "{dose.notes}"</p>
                    )}
                  </div>

                  {dose.status === DOSE_STATUS.UPCOMING && canModifyDoses && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkDoseClick(dose)}
                      >
                        Mark Taken
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markDose(dose.id, DOSE_STATUS.SKIPPED, 'Skipped by Family', true)}
                      >
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Recent Care Circle Activity</span>
            </h3>

            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{log.description}</p>
                    <span className="text-slate-400">
                      {formatDateTimeToReadable(log.created_at)}
                    </span>
                  </div>
                  <Badge variant="default" size="sm">Audit Log</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Healthcare Profile & Upcoming Appointments */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Overview Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Healthcare Profile</h4>
              <Badge variant="primary" size="sm">Protected</Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Allergies</span>
                <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {elderlyProfile?.allergies || 'None'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Medical Conditions</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {elderlyProfile?.medical_conditions || 'None reported'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Blood Group</span>
                <span className="font-bold text-slate-900">{elderlyProfile?.blood_group || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Emergency Contact</span>
                <span className="font-semibold text-slate-900 block">
                  {elderlyProfile?.emergency_contact_name} ({elderlyProfile?.emergency_contact_relation})
                </span>
                <a href={`tel:${elderlyProfile?.emergency_contact_phone}`} className="text-teal-700 text-xs font-bold hover:underline">
                  {elderlyProfile?.emergency_contact_phone}
                </a>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Primary Doctor</span>
                <span className="font-semibold text-slate-900 block">{elderlyProfile?.primary_doctor_name}</span>
                <span className="text-xs text-slate-500">{elderlyProfile?.primary_doctor_phone}</span>
              </div>
            </div>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Doctor Visits</h4>
              {canModifyDoses && (
                <button
                  onClick={() => setApptModalOpen(true)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{appt.doctor_name}</span>
                    <Badge variant="info" size="sm">Scheduled</Badge>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{appt.specialty} • {appt.clinic_or_hospital}</p>
                  <p className="text-xs font-bold text-teal-800">
                    {formatDateTimeToReadable(appt.appointment_time)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={apptModalOpen}
        onClose={() => setApptModalOpen(false)}
        title="Schedule Doctor Appointment"
        subtitle={`Add a new healthcare visit for ${elderlyProfile?.full_name}.`}
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <Input
            label="Doctor Name"
            placeholder="e.g. Dr. Rajiv Verma"
            value={newDoctorName}
            onChange={(e) => setNewDoctorName(e.target.value)}
            required
          />
          <Input
            label="Specialty / Purpose"
            placeholder="e.g. Cardiology Review, Routine Eye Checkup"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
          />
          <Input
            label="Hospital or Clinic"
            placeholder="e.g. Apollo Specialty Clinic, Room 304"
            value={newClinic}
            onChange={(e) => setNewClinic(e.target.value)}
            required
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={newApptTime}
            onChange={(e) => setNewApptTime(e.target.value)}
            required
          />
          <Input
            label="Preparation Notes"
            placeholder="e.g. Fasting 10 hours, bring previous ECG reports"
            value={newApptNotes}
            onChange={(e) => setNewApptNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setApptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Premature Early Dose Confirmation Modal */}
      <EarlyDoseModal
        isOpen={earlyModalOpen}
        onClose={() => {
          setEarlyModalOpen(false);
          setEarlyDoseTarget(null);
        }}
        onConfirm={handleConfirmEarlyDose}
        dose={earlyDoseTarget}
        minutesAhead={earlyMinutesAhead}
      />
    </div>
  );
}
