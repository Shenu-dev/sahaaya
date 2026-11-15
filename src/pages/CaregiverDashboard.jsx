import React, { useState } from 'react';
import { 
  UserCheck, 
  Pill, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Clock, 
  Activity,
  HeartHandshake
} from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { useAuth } from '../context/AuthContext';
import { DOSE_STATUS } from '../lib/constants';
import { formatTimeTo12Hour, formatDateTimeToReadable, checkIsFutureDose } from '../lib/dateUtils';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import EarlyDoseModal from '../components/common/EarlyDoseModal';

export default function CaregiverDashboard() {
  const { profile } = useAuth();
  const { 
    elderlyProfile, 
    todayDoses, 
    appointments, 
    markDose, 
    activityLogs, 
    careCircle,
    canModifyDoses 
  } = useCareCircle();

  const [administerModalOpen, setAdministerModalOpen] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [caregiverNotes, setCaregiverNotes] = useState('Administered per schedule. Patient vitals stable.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Premature Dose Early Confirmation State
  const [earlyModalOpen, setEarlyModalOpen] = useState(false);
  const [earlyMinutesAhead, setEarlyMinutesAhead] = useState(0);

  const handleOpenAdminister = (dose) => {
    setSelectedDose(dose);
    setCaregiverNotes('Administered per schedule. Patient vitals stable.');

    // Check if early administration
    const futureCheck = checkIsFutureDose(dose.scheduled_time);
    if (futureCheck.isFuture) {
      setEarlyMinutesAhead(futureCheck.minutesAhead);
      setEarlyModalOpen(true);
      return;
    }

    setAdministerModalOpen(true);
  };

  const handleConfirmEarlyWarning = () => {
    setEarlyModalOpen(false);
    setAdministerModalOpen(true);
  };

  const handleConfirmAdminister = async (status) => {
    if (!selectedDose) return;
    setIsSubmitting(true);
    await markDose(selectedDose.id, status, caregiverNotes, true);
    setIsSubmitting(false);
    setAdministerModalOpen(false);
    setSelectedDose(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Clinical Caregiver Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            Shift Management • {profile?.full_name || 'Caregiver'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assigned patient: <span className="font-bold text-slate-800">{elderlyProfile?.full_name}</span> (Care Circle: {careCircle?.name})
          </p>
        </div>

        <Badge variant="primary" size="lg" className="gap-2">
          <HeartHandshake className="w-4 h-4" />
          <span>Active Clinical Shift</span>
        </Badge>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Shift Medication Administration Checklist */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Shift Medication Administration</h3>
                  <p className="text-xs text-slate-500">Record dosage delivery with clinical observations</p>
                </div>
              </div>
              <Badge variant="info" size="sm">Verified Recording</Badge>
            </div>

            <div className="space-y-3.5">
              {todayDoses.map((dose) => {
                const isTaken = dose.status === DOSE_STATUS.TAKEN;

                return (
                  <div
                    key={dose.id}
                    className={`p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isTaken ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-base">{dose.med_name}</span>
                        <Badge doseStatus={dose.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Dose: {dose.dosage} • Scheduled: <span className="font-bold text-slate-800">{formatTimeTo12Hour(dose.scheduled_time)}</span>
                      </p>
                      {dose.recorded_at && (
                        <p className="text-xs text-emerald-800 font-semibold">
                          Recorded at: <span className="font-bold">{formatTimeTo12Hour(dose.recorded_at)}</span> by {dose.recorded_by_name || 'Caregiver'}
                        </p>
                      )}
                      {dose.notes && (
                        <p className="text-xs italic text-slate-500">Observation: "{dose.notes}"</p>
                      )}
                    </div>

                    {!isTaken && canModifyDoses && (
                      <Button
                        variant="primary"
                        size="md"
                        icon={CheckCircle2}
                        onClick={() => handleOpenAdminister(dose)}
                      >
                        Record Administration
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caregiver Shift Logs */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Shift Activity History</span>
            </h3>

            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{log.description}</p>
                    <span className="text-slate-400">
                      {formatDateTimeToReadable(log.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Patient Clinical Overview */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Patient Medical File</h4>
              <p className="text-xs text-slate-500">Authorized Care Recipient</p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{elderlyProfile?.full_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Critical Allergies</span>
                <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {elderlyProfile?.allergies || 'None'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Conditions Under Care</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {elderlyProfile?.medical_conditions || 'None reported'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Emergency Family Contact</span>
                <span className="font-semibold text-slate-900 block">{elderlyProfile?.emergency_contact_name}</span>
                <span className="text-xs text-slate-500">{elderlyProfile?.emergency_contact_phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Attending Doctor</span>
                <span className="font-semibold text-slate-900 block">{elderlyProfile?.primary_doctor_name}</span>
                <span className="text-xs text-slate-500">{elderlyProfile?.primary_doctor_phone}</span>
              </div>
            </div>
          </Card>

          {/* Upcoming Visits */}
          <Card className="space-y-3">
            <h4 className="font-bold text-slate-900 text-base pb-2 border-b border-slate-100">
              Upcoming Medical Consultations
            </h4>
            {appointments.map((appt) => (
              <div key={appt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">{appt.doctor_name}</span>
                <span className="text-slate-600 block">{appt.specialty}</span>
                <span className="text-teal-800 font-bold block">
                  {formatDateTimeToReadable(appt.appointment_time)}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Administration Modal */}
      <Modal
        isOpen={administerModalOpen}
        onClose={() => setAdministerModalOpen(false)}
        title="Record Medication Administration"
        subtitle={`Administering ${selectedDose?.med_name} (${selectedDose?.dosage}) to ${elderlyProfile?.full_name}. Scheduled: ${formatTimeTo12Hour(selectedDose?.scheduled_time)}.`}
      >
        <div className="space-y-4">
          <Input
            label="Clinical Notes / Patient Observation"
            value={caregiverNotes}
            onChange={(e) => setCaregiverNotes(e.target.value)}
            placeholder="e.g. Administered after lunch. Patient vitals stable, no complaints."
            helperText="Recorded immutably in the patient's medication history."
          />

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => handleConfirmAdminister(DOSE_STATUS.SKIPPED)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Mark Skipped
            </Button>
            <Button
              variant="primary"
              onClick={() => handleConfirmAdminister(DOSE_STATUS.TAKEN)}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Confirm Administered
            </Button>
          </div>
        </div>
      </Modal>

      {/* Premature Early Dose Confirmation Modal */}
      <EarlyDoseModal
        isOpen={earlyModalOpen}
        onClose={() => {
          setEarlyModalOpen(false);
          setSelectedDose(null);
        }}
        onConfirm={handleConfirmEarlyWarning}
        dose={selectedDose}
        minutesAhead={earlyMinutesAhead}
      />
    </div>
  );
}
