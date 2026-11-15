export const ROLES = {
  ELDERLY: 'elderly',
  FAMILY: 'family',
  CAREGIVER: 'caregiver',
};

export const PERMISSIONS = {
  ADMIN: 'admin',
  WRITE: 'write',
  READ: 'read',
};

export const DOSE_STATUS = {
  UPCOMING: 'upcoming',
  TAKEN: 'taken',
  SKIPPED: 'skipped',
  MISSED: 'missed',
  UNCONFIRMED: 'unconfirmed',
};

export const DOSE_STATUS_CONFIG = {
  [DOSE_STATUS.UPCOMING]: {
    label: 'Upcoming',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  [DOSE_STATUS.TAKEN]: {
    label: 'Taken',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  [DOSE_STATUS.SKIPPED]: {
    label: 'Skipped',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  [DOSE_STATUS.MISSED]: {
    label: 'Missed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  [DOSE_STATUS.UNCONFIRMED]: {
    label: 'Unconfirmed',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800',
    dot: 'bg-slate-500',
  },
};

export const MEDICATION_FORMS = [
  { value: 'tablet', label: 'Tablet / Pill' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup / Liquid' },
  { value: 'drops', label: 'Drops (Eye/Ear)' },
  { value: 'inhaler', label: 'Inhaler / Spray' },
  { value: 'injection', label: 'Injection' },
  { value: 'other', label: 'Other' },
];

export const DEMO_ACCOUNTS = {
  ELDERLY: {
    email: 'kamla.elderly@saarthi.demo',
    password: 'Saarthi@2026',
    role: 'elderly',
    name: 'Kamla Sharma',
    age: 74,
  },
  FAMILY: {
    email: 'rohan.family@saarthi.demo',
    password: 'Saarthi@2026',
    role: 'family',
    name: 'Rohan Sharma (Son)',
    permissions: 'admin',
  },
  CAREGIVER: {
    email: 'priya.nurse@saarthi.demo',
    password: 'Saarthi@2026',
    role: 'caregiver',
    name: 'Nurse Priya Rao',
    permissions: 'write',
  },
};
