import React, { useState } from 'react';
import { CheckCircle2, Clock, Phone, AlertCircle, Calendar, ShieldCheck, Heart, Sparkles, UserCheck } from 'lucide-react';
import { useCareCircle } from '../context/CareCircleContext';
import { DOSE_STATUS } from '../lib/constants';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

export default function ElderlyDashboard() {
  const { elderlyProfile, todayDoses, appointments, markDose, careCircle } = useCareCircle();
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [skipReason, setSkipReason] = useState('Feeling unwell / nauseous');

  // Find the immediate next upcoming or missed dose
  const nextDose = todayDoses.find((d) => d.status === DOSE_STATUS.UPCOMING) || todayDoses[0];
  const upcomingAppointment = appointments.find((a) => a.status === 'upcoming');

  const handleMarkTaken = async (doseId) => {
    await markDose(doseId, DOSE_STATUS.TAKEN, 'Taken by senior');
  };

  const handleOpenSkipModal = (dose) => {
    setSelectedDose(dose);
    setSkipModalOpen(true);
  };

  const handleConfirmSkip = async () => {
    if (selectedDose) {
      await markDose(selectedDose.id, DOSE_STATUS.SKIPPED, skipReason);
      setSkipModalOpen(false);
      setSelectedDose(null);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Elderly Greeting Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-elevated">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-600/60 px-3 py-1 rounded-full text-xs font-semibold text-teal-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Namaste & Welcome Back</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {elderlyProfile?.full_name || 'Kamla Sharma'}
            </h1>
            <p className="text-lg text-teal-100 mt-1 font-medium">{todayFormatted}</p>
          </div>

          {/* Emergency Call Quick Button */}
          {elderlyProfile?.emergency_contact_phone && (
            <a
              href={`tel:${elderlyProfile.emergency_contact_phone}`}
              className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg px-6 py-4 rounded-2xl shadow-lg border-2 border-red-400 touch-target-elderly transition-transform active:scale-95"
            >
              <Phone className="w-6 h-6 fill-white" />
              <span>Call Emergency</span>
            </a>
          )}
        </div>
      </div>

      {/* Immediate Next Dose Hero (Prominent Single-Action Center) */}
      {nextDose && nextDose.status === DOSE_STATUS.UPCOMING && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-teal-500 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-bold text-teal-800 bg-teal-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              YOUR NEXT MEDICATION
            </span>
            <span className="text-lg font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Scheduled: {nextDose.scheduled_time}</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
              {nextDose.med_name}
            </h2>
            <p className="text-xl font-bold text-teal-700 mt-1">
              Dosage: {nextDose.dosage}
            </p>
            <p className="text-lg text-slate-600 mt-2 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
              Instructions: Take with warm water after eating.
            </p>
          </div>

          {/* Large Senior-Friendly Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleMarkTaken(nextDose.id)}
              className="w-full touch-target-elderly bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-2xl py-5 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all"
            >
              <CheckCircle2 className="w-8 h-8" />
              <span>I HAVE TAKEN THIS</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenSkipModal(nextDose)}
              className="w-full touch-target-elderly bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg py-5 px-6 rounded-2xl border-2 border-slate-300 flex items-center justify-center gap-2 transition-all"
            >
              <span>Skip / Could Not Take</span>
            </button>
          </div>
        </div>
      )}

      {/* Today's Full Schedule List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <span>Today's Medicine Schedule</span>
        </h2>

        <div className="grid gap-4">
          {todayDoses.map((dose) => {
            const isTaken = dose.status === DOSE_STATUS.TAKEN;
            const isMissed = dose.status === DOSE_STATUS.MISSED;

            return (
              <div
                key={dose.id}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isTaken
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : isMissed
                    ? 'bg-red-50/60 border-red-300'
                    : 'bg-white border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-slate-900">{dose.med_name}</span>
                    <Badge doseStatus={dose.status} size="lg" />
                  </div>
                  <p className="text-base font-semibold text-slate-600">
                    {dose.dosage} • Time: {dose.scheduled_time}
                  </p>
                  {isTaken && dose.recorded_at && (
                    <p className="text-sm font-bold text-emerald-800">
                      ✓ Taken at {new Date(dose.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {dose.notes && (
                    <p className="text-sm italic text-slate-500">Note: "{dose.notes}"</p>
                  )}
                </div>

                {!isTaken && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleMarkTaken(dose.id)}
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md min-h-[50px] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Take</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSkipModal(dose)}
                      className="px-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Doctor Appointment Card */}
      {upcomingAppointment && (
        <div className="bg-teal-50 rounded-2xl p-6 border-2 border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-600 text-white rounded-2xl shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Next Doctor Visit</span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{upcomingAppointment.doctor_name}</h3>
              <p className="text-base text-slate-700 font-medium">
                {upcomingAppointment.specialty} • {upcomingAppointment.clinic_or_hospital}
              </p>
              <p className="text-sm font-bold text-teal-900 mt-1">
                {new Date(upcomingAppointment.appointment_time).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency & Doctor Contact Footnote */}
      <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 grid sm:grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Family Contact</span>
          <p className="text-lg font-bold text-slate-900">{elderlyProfile?.emergency_contact_name}</p>
          <a
            href={`tel:${elderlyProfile?.emergency_contact_phone}`}
            className="text-teal-700 font-bold text-base hover:underline flex items-center gap-1.5 mt-1"
          >
            <Phone className="w-4 h-4" />
            <span>{elderlyProfile?.emergency_contact_phone}</span>
          </a>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Doctor</span>
          <p className="text-lg font-bold text-slate-900">{elderlyProfile?.primary_doctor_name}</p>
          <a
            href={`tel:${elderlyProfile?.primary_doctor_phone}`}
            className="text-teal-700 font-bold text-base hover:underline flex items-center gap-1.5 mt-1"
          >
            <Phone className="w-4 h-4" />
            <span>{elderlyProfile?.primary_doctor_phone}</span>
          </a>
        </div>
      </div>

      {/* Skip Dose Modal */}
      <Modal
        isOpen={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        title="Reason for Skipping Dose"
        subtitle={`Please let your family know why you are skipping ${selectedDose?.med_name}.`}
        isElderly={true}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {[
              'Feeling unwell / nauseous',
              'Already took it earlier',
              'Doctor advised pause',
              'Out of medicine stock',
              'Forgot / will take later',
            ].map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-teal-500 cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="skipReason"
                  checked={skipReason === reason}
                  onChange={() => setSkipReason(reason)}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-lg font-semibold text-slate-800">{reason}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setSkipModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmSkip}
              className="flex-1 bg-amber-600 hover:bg-amber-700 border-amber-800"
            >
              Confirm Skip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
