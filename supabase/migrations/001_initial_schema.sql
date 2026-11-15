-- ==============================================================================
-- SAHAAYA DATABASE MIGRATION 001: INITIAL SCHEMA & INTEGRITY CONSTRAINTS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles Table (Synchronized with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'elderly' CHECK (role IN ('elderly', 'family', 'caregiver')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Care Circles Table
CREATE TABLE IF NOT EXISTS public.care_circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_elderly_id UUID, -- Circular reference linked after elderly_profiles
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Elderly Healthcare Profiles Table
CREATE TABLE IF NOT EXISTS public.elderly_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    care_circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    allergies TEXT DEFAULT 'None reported',
    medical_conditions TEXT DEFAULT 'None reported',
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relation TEXT DEFAULT 'Family',
    primary_doctor_name TEXT,
    primary_doctor_phone TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safely add circular foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_care_circles_primary_elderly'
  ) THEN
    ALTER TABLE public.care_circles
      ADD CONSTRAINT fk_care_circles_primary_elderly
      FOREIGN KEY (primary_elderly_id) REFERENCES public.elderly_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Care Circle Memberships Table
CREATE TABLE IF NOT EXISTS public.care_circle_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_role TEXT NOT NULL CHECK (member_role IN ('elderly', 'family', 'caregiver')),
    permissions TEXT NOT NULL CHECK (permissions IN ('admin', 'write', 'read')),
    relationship_label TEXT NOT NULL DEFAULT 'Caregiver',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_circle_member UNIQUE (care_circle_id, profile_id)
);

-- 6. Cryptographically Secure Care Circle Invitations
CREATE TABLE IF NOT EXISTS public.care_circle_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of random invite token
    member_role TEXT NOT NULL CHECK (member_role IN ('family', 'caregiver')),
    permissions TEXT NOT NULL CHECK (permissions IN ('write', 'read')),
    relationship_label TEXT NOT NULL DEFAULT 'Family Member',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

-- 7. Medications Table (Archivable to preserve medical history)
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    form TEXT NOT NULL CHECK (form IN ('tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'other')),
    instructions TEXT DEFAULT 'Take after meal with water',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    archived_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Medication Schedules Table
CREATE TABLE IF NOT EXISTS public.medication_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    scheduled_time TIME NOT NULL,
    frequency_type TEXT NOT NULL DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'specific_days', 'as_needed')),
    days_of_week INT[] DEFAULT '{0,1,2,3,4,5,6}',
    dose_quantity NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Medication Doses Table
CREATE TABLE IF NOT EXISTS public.medication_doses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.medication_schedules(id) ON DELETE RESTRICT,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE RESTRICT,
    elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE RESTRICT,
    dose_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'taken', 'skipped', 'missed', 'unconfirmed')),
    recorded_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- STRICT INTEGRITY CONSTRAINT: Prevents duplicate dose slots
    CONSTRAINT uq_schedule_dose_slot UNIQUE (schedule_id, dose_date, scheduled_time)
);

-- 10. Immutable Dose Status Audit History Table
CREATE TABLE IF NOT EXISTS public.medication_dose_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dose_id UUID NOT NULL REFERENCES public.medication_doses(id) ON DELETE RESTRICT,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT DEFAULT 'General Physician',
    clinic_or_hospital TEXT NOT NULL,
    appointment_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('dose_reminder', 'dose_missed', 'dose_taken', 'appointment_reminder', 'circle_update')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
    elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
    performed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Fast Query Performance
CREATE INDEX IF NOT EXISTS idx_ccm_profile ON public.care_circle_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_ccm_circle ON public.care_circle_members(care_circle_id);
CREATE INDEX IF NOT EXISTS idx_doses_elderly_date ON public.medication_doses(elderly_id, dose_date);
CREATE INDEX IF NOT EXISTS idx_doses_status ON public.medication_doses(status);
CREATE INDEX IF NOT EXISTS idx_dose_history_dose ON public.medication_dose_history(dose_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON public.appointments(elderly_id, appointment_time);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON public.care_circle_invitations(token_hash);
