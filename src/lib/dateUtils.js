/**
 * Date and Time utilities for Saarthi
 * Standardizes 12-hour AM/PM formats, readable dates, and premature dose detection.
 */

export function formatTimeTo12Hour(timeStr) {
  if (!timeStr) return '--:--';

  // If it's a full ISO timestamp
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }

  // If it's HH:mm:ss or HH:mm
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }

  return timeStr;
}

export function formatDateToReadable(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTimeToReadable(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Checks if a scheduled dose time is in the future compared to current time.
 * @param {string} scheduledTimeStr e.g. "13:00:00"
 * @param {string} doseDateStr e.g. "2026-11-15" (defaults to today)
 * @returns {{ isFuture: boolean, minutesAhead: number, formattedScheduled: string }}
 */
export function checkIsFutureDose(scheduledTimeStr, doseDateStr) {
  if (!scheduledTimeStr) return { isFuture: false, minutesAhead: 0, formattedScheduled: '' };

  const now = new Date();
  const [hours, minutes] = scheduledTimeStr.split(':').map((s) => parseInt(s, 10));

  const scheduledDate = doseDateStr ? new Date(doseDateStr) : new Date();
  scheduledDate.setHours(hours || 0, minutes || 0, 0, 0);

  const diffMs = scheduledDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // If more than 15 minutes in the future, consider it early administration
  const isFuture = diffMinutes > 15;

  return {
    isFuture,
    minutesAhead: Math.max(0, diffMinutes),
    formattedScheduled: formatTimeTo12Hour(scheduledTimeStr),
  };
}
