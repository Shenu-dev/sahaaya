import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { formatTimeTo12Hour } from '../../lib/dateUtils';

export default function EarlyDoseModal({
  isOpen,
  onClose,
  onConfirm,
  dose,
  minutesAhead = 0,
  isElderly = false,
  isLoading = false,
}) {
  if (!dose) return null;

  const formattedScheduled = formatTimeTo12Hour(dose.scheduled_time);
  const currentTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  const hoursAhead = Math.floor(minutesAhead / 60);
  const remainingMins = minutesAhead % 60;
  const timeAheadText = hoursAhead > 0 
    ? `${hoursAhead} hr ${remainingMins > 0 ? `${remainingMins} min` : ''}`.trim()
    : `${minutesAhead} minutes`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Early Dose Administration"
      subtitle={isElderly ? "This medicine is scheduled for later." : "Premature administration confirmation"}
      maxWidth="max-w-md"
      isElderly={isElderly}
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3.5">
          <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-amber-900">
            <p className="font-bold">
              {dose.med_name} ({dose.dosage}) is scheduled for {formattedScheduled}.
            </p>
            <p className="text-amber-800">
              Current time is <span className="font-bold">{currentTime}</span> (scheduled approx. <span className="font-bold">{timeAheadText}</span> in the future).
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Administering medication ahead of schedule should only be done if advised by a physician or caregiver. The actual administration time ({currentTime}) will be permanently recorded in the medication audit log.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            size={isElderly ? "lg" : "md"}
          >
            Cancel (Wait for Schedule)
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            size={isElderly ? "lg" : "md"}
            className="bg-amber-600 hover:bg-amber-700 border-amber-800 text-white"
          >
            Confirm Early Dose
          </Button>
        </div>
      </div>
    </Modal>
  );
}
