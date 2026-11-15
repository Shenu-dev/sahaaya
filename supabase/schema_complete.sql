-- ==============================================================================
-- SAHAAYA COMPLETE SINGLE-EXECUTION DATABASE SCRIPT
-- Paste and run this entire file in your Supabase SQL Editor
-- Cost: ₹0 / $0 (Supabase Free Tier)
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
    primary_elderly_id UUID,
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
    token_hash TEXT NOT NULL UNIQUE,
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

-- 7. Medications Table
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ccm_profile ON public.care_circle_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_ccm_circle ON public.care_circle_members(care_circle_id);
CREATE INDEX IF NOT EXISTS idx_doses_elderly_date ON public.medication_doses(elderly_id, dose_date);
CREATE INDEX IF NOT EXISTS idx_doses_status ON public.medication_doses(status);
CREATE INDEX IF NOT EXISTS idx_dose_history_dose ON public.medication_dose_history(dose_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON public.appointments(elderly_id, appointment_time);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_invitations_token_hash ON public.care_circle_invitations(token_hash);

-- ==============================================================================
-- STORED PROCEDURES & TRIGGERS
-- ==============================================================================

-- Trigger: Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sahaaya User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'elderly'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Trigger: Handle dose status audit log
CREATE OR REPLACE FUNCTION public.handle_dose_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.medication_dose_history (
      dose_id, previous_status, new_status, changed_by, notes, changed_at
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.recorded_by, auth.uid()),
      NEW.notes,
      NOW()
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.medication_dose_history (
      dose_id, previous_status, new_status, changed_by, notes, changed_at
    ) VALUES (
      NEW.id,
      NULL,
      NEW.status,
      COALESCE(NEW.recorded_by, auth.uid()),
      NEW.notes,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_medication_dose_history ON public.medication_doses;
CREATE TRIGGER trg_medication_dose_history
  AFTER INSERT OR UPDATE ON public.medication_doses
  FOR EACH ROW EXECUTE FUNCTION public.handle_dose_status_change();

REVOKE ALL ON FUNCTION public.handle_dose_status_change() FROM PUBLIC;

-- Trigger: Prevent medication hard delete
CREATE OR REPLACE FUNCTION public.prevent_medication_hard_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.medication_doses WHERE medication_id = OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete medication with existing dose records. Archive the medication instead.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_medication_hard_delete ON public.medications;
CREATE TRIGGER trg_prevent_medication_hard_delete
  BEFORE DELETE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.prevent_medication_hard_delete();

REVOKE ALL ON FUNCTION public.prevent_medication_hard_delete() FROM PUBLIC;

-- Authorization Helpers
CREATE OR REPLACE FUNCTION public.is_member_of_circle(p_circle_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.care_circle_members
    WHERE care_circle_id = p_circle_id AND profile_id = auth.uid()
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.has_circle_write(p_circle_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.care_circle_members
    WHERE care_circle_id = p_circle_id 
      AND profile_id = auth.uid()
      AND permissions IN ('admin', 'write')
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.has_circle_admin(p_circle_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.care_circle_members
    WHERE care_circle_id = p_circle_id 
      AND profile_id = auth.uid()
      AND permissions = 'admin'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_circle_for_elderly(p_elderly_id UUID)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT care_circle_id FROM public.elderly_profiles WHERE id = p_elderly_id;
$$ LANGUAGE sql STABLE;

REVOKE ALL ON FUNCTION public.is_member_of_circle(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_circle_write(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_circle_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_circle_for_elderly(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_member_of_circle(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_circle_write(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_circle_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_circle_for_elderly(UUID) TO authenticated;

-- Procedure: Atomic Care Circle Creation
CREATE OR REPLACE FUNCTION public.create_care_circle_atomic(
  p_circle_name TEXT,
  p_elderly_name TEXT,
  p_date_of_birth DATE,
  p_gender TEXT,
  p_blood_group TEXT,
  p_allergies TEXT,
  p_medical_conditions TEXT,
  p_emergency_name TEXT,
  p_emergency_phone TEXT,
  p_emergency_relation TEXT,
  p_doctor_name TEXT,
  p_doctor_phone TEXT,
  p_timezone TEXT DEFAULT 'Asia/Kolkata',
  p_user_role TEXT DEFAULT 'elderly'
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_circle_id UUID;
  v_elderly_id UUID;
  v_member_label TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF p_user_role NOT IN ('elderly', 'family') THEN
    p_user_role := 'elderly';
  END IF;

  v_member_label := CASE WHEN p_user_role = 'elderly' THEN 'Elderly Self' ELSE 'Primary Family Admin' END;

  INSERT INTO public.care_circles (name, created_by)
  VALUES (p_circle_name, v_user_id)
  RETURNING id INTO v_circle_id;

  INSERT INTO public.elderly_profiles (
    profile_id, care_circle_id, full_name, date_of_birth, gender, blood_group,
    allergies, medical_conditions, emergency_contact_name, emergency_contact_phone,
    emergency_contact_relation, primary_doctor_name, primary_doctor_phone, timezone
  ) VALUES (
    CASE WHEN p_user_role = 'elderly' THEN v_user_id ELSE NULL END,
    v_circle_id, p_elderly_name, p_date_of_birth, p_gender, p_blood_group,
    COALESCE(p_allergies, 'None reported'), COALESCE(p_medical_conditions, 'None reported'),
    p_emergency_name, p_emergency_phone, COALESCE(p_emergency_relation, 'Family'),
    p_doctor_name, p_doctor_phone, COALESCE(p_timezone, 'Asia/Kolkata')
  )
  RETURNING id INTO v_elderly_id;

  UPDATE public.care_circles SET primary_elderly_id = v_elderly_id WHERE id = v_circle_id;

  INSERT INTO public.care_circle_members (
    care_circle_id, profile_id, member_role, permissions, relationship_label
  ) VALUES (
    v_circle_id, v_user_id, p_user_role, 'admin', v_member_label
  );

  INSERT INTO public.activity_logs (
    care_circle_id, elderly_id, performed_by, action_type, description
  ) VALUES (
    v_circle_id, v_elderly_id, v_user_id, 'circle_created',
    'Care circle created by ' || COALESCE((SELECT full_name FROM public.profiles WHERE id = v_user_id), 'user')
  );

  RETURN jsonb_build_object(
    'success', true,
    'care_circle_id', v_circle_id,
    'elderly_profile_id', v_elderly_id
  );
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.create_care_circle_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_care_circle_atomic TO authenticated;

-- Procedure: Atomic Invitation Acceptance
CREATE OR REPLACE FUNCTION public.accept_care_circle_invitation(p_token_hash TEXT)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;

  SELECT * INTO v_invitation
  FROM public.care_circle_invitations
  WHERE token_hash = p_token_hash
    AND status = 'pending'
    AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, expired, or already used invitation.';
  END IF;

  IF LOWER(v_invitation.invited_email) <> LOWER(v_user_email) THEN
    RAISE EXCEPTION 'This invitation was issued to % and cannot be accepted by %.', v_invitation.invited_email, v_user_email;
  END IF;

  INSERT INTO public.care_circle_members (
    care_circle_id, profile_id, member_role, permissions, relationship_label
  ) VALUES (
    v_invitation.care_circle_id,
    v_user_id,
    v_invitation.member_role,
    v_invitation.permissions,
    v_invitation.relationship_label
  ) ON CONFLICT (care_circle_id, profile_id) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    member_role = EXCLUDED.member_role;

  UPDATE public.care_circle_invitations
  SET status = 'accepted', accepted_by = v_user_id, accepted_at = NOW()
  WHERE id = v_invitation.id;

  INSERT INTO public.activity_logs (
    care_circle_id, elderly_id, performed_by, action_type, description
  ) VALUES (
    v_invitation.care_circle_id,
    (SELECT primary_elderly_id FROM public.care_circles WHERE id = v_invitation.care_circle_id),
    v_user_id, 'member_joined',
    v_user_email || ' joined the care circle as ' || v_invitation.relationship_label
  );

  RETURN jsonb_build_object('success', true, 'care_circle_id', v_invitation.care_circle_id);
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.accept_care_circle_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_care_circle_invitation(TEXT) TO authenticated;

-- Procedure: Idempotent Daily Dose Generation
CREATE OR REPLACE FUNCTION public.generate_daily_doses(p_elderly_id UUID, p_target_date DATE)
RETURNS INT
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_circle_id UUID;
  v_day_of_week INT;
  v_inserted_count INT := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT care_circle_id INTO v_circle_id FROM public.elderly_profiles WHERE id = p_elderly_id;
  IF v_circle_id IS NULL THEN
    RAISE EXCEPTION 'Elderly profile not found.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.care_circle_members
    WHERE care_circle_id = v_circle_id AND profile_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this Care Circle.';
  END IF;

  v_day_of_week := EXTRACT(DOW FROM p_target_date);

  INSERT INTO public.medication_doses (
    schedule_id, medication_id, elderly_id, dose_date, scheduled_time, status
  )
  SELECT 
    ms.id,
    m.id,
    m.elderly_id,
    p_target_date,
    ms.scheduled_time,
    'upcoming'
  FROM public.medication_schedules ms
  JOIN public.medications m ON m.id = ms.medication_id
  WHERE m.elderly_id = p_elderly_id
    AND m.is_active = TRUE
    AND m.start_date <= p_target_date
    AND (m.end_date IS NULL OR m.end_date >= p_target_date)
    AND (
      ms.frequency_type = 'daily' OR 
      (ms.frequency_type = 'specific_days' AND v_day_of_week = ANY(ms.days_of_week))
    )
  ON CONFLICT (schedule_id, dose_date, scheduled_time) DO NOTHING;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.generate_daily_doses(UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_daily_doses(UUID, DATE) TO authenticated;

-- Procedure: On-Demand Missed Dose Evaluator
CREATE OR REPLACE FUNCTION public.evaluate_missed_doses(p_elderly_id UUID)
RETURNS INT
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_circle_id UUID;
  v_tz TEXT;
  v_current_tz_timestamp TIMESTAMP;
  v_updated_count INT := 0;
  r_dose RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT care_circle_id, timezone INTO v_circle_id, v_tz
  FROM public.elderly_profiles WHERE id = p_elderly_id;

  IF v_circle_id IS NULL THEN
    RAISE EXCEPTION 'Elderly profile not found.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.care_circle_members
    WHERE care_circle_id = v_circle_id AND profile_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this Care Circle.';
  END IF;

  IF v_tz IS NULL THEN v_tz := 'Asia/Kolkata'; END IF;
  
  -- Current timestamp localized to patient's timezone
  v_current_tz_timestamp := (NOW() AT TIME ZONE v_tz);

  -- Safe timestamp comparison permanently prevents midnight wraparound bug (SEC-CRIT-01)
  FOR r_dose IN 
    SELECT d.id, d.elderly_id, m.name AS med_name, d.scheduled_time, d.dose_date
    FROM public.medication_doses d
    JOIN public.medications m ON m.id = d.medication_id
    WHERE d.elderly_id = p_elderly_id
      AND d.status = 'upcoming'
      AND (d.dose_date + d.scheduled_time) < (v_current_tz_timestamp - INTERVAL '60 minutes')
  LOOP
    UPDATE public.medication_doses
    SET status = 'missed', updated_at = NOW()
    WHERE id = r_dose.id;

    INSERT INTO public.notifications (recipient_id, elderly_id, type, title, message)
    SELECT 
      ccm.profile_id,
      p_elderly_id,
      'dose_missed',
      'Missed Medication Alert',
      r_dose.med_name || ' scheduled for ' || r_dose.scheduled_time || ' on ' || r_dose.dose_date || ' was marked as missed.'
    FROM public.care_circle_members ccm
    WHERE ccm.care_circle_id = v_circle_id;

    v_updated_count := v_updated_count + 1;
  END LOOP;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.evaluate_missed_doses(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evaluate_missed_doses(UUID) TO authenticated;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own_or_peers" ON public.profiles;
CREATE POLICY "profiles_select_own_or_peers" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.care_circle_members m1
    JOIN public.care_circle_members m2 ON m1.care_circle_id = m2.care_circle_id
    WHERE m1.profile_id = auth.uid() AND m2.profile_id = profiles.id
  ));
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_delete_denied" ON public.profiles;
CREATE POLICY "profiles_delete_denied" ON public.profiles FOR DELETE USING (false);

ALTER TABLE public.care_circles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "circles_select_members" ON public.care_circles;
CREATE POLICY "circles_select_members" ON public.care_circles FOR SELECT
  USING (is_member_of_circle(id) OR created_by = auth.uid());
DROP POLICY IF EXISTS "circles_insert_denied_direct" ON public.care_circles;
CREATE POLICY "circles_insert_denied_direct" ON public.care_circles FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "circles_update_admins" ON public.care_circles;
CREATE POLICY "circles_update_admins" ON public.care_circles FOR UPDATE USING (has_circle_admin(id)) WITH CHECK (has_circle_admin(id));
DROP POLICY IF EXISTS "circles_delete_denied" ON public.care_circles;
CREATE POLICY "circles_delete_denied" ON public.care_circles FOR DELETE USING (false);

ALTER TABLE public.elderly_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "elderly_select_members" ON public.elderly_profiles;
CREATE POLICY "elderly_select_members" ON public.elderly_profiles FOR SELECT
  USING (is_member_of_circle(care_circle_id) OR profile_id = auth.uid());
DROP POLICY IF EXISTS "elderly_insert_denied_direct" ON public.elderly_profiles;
CREATE POLICY "elderly_insert_denied_direct" ON public.elderly_profiles FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "elderly_update_authorized" ON public.elderly_profiles;
CREATE POLICY "elderly_update_authorized" ON public.elderly_profiles FOR UPDATE
  USING (profile_id = auth.uid() OR has_circle_write(care_circle_id))
  WITH CHECK (profile_id = auth.uid() OR has_circle_write(care_circle_id));
DROP POLICY IF EXISTS "elderly_delete_denied" ON public.elderly_profiles;
CREATE POLICY "elderly_delete_denied" ON public.elderly_profiles FOR DELETE USING (false);

ALTER TABLE public.care_circle_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members_select_peers" ON public.care_circle_members;
CREATE POLICY "members_select_peers" ON public.care_circle_members FOR SELECT USING (is_member_of_circle(care_circle_id));
DROP POLICY IF EXISTS "members_insert_denied_direct" ON public.care_circle_members;
CREATE POLICY "members_insert_denied_direct" ON public.care_circle_members FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "members_update_admins" ON public.care_circle_members;
CREATE POLICY "members_update_admins" ON public.care_circle_members FOR UPDATE
  USING (has_circle_admin(care_circle_id) AND member_role <> 'elderly')
  WITH CHECK (has_circle_admin(care_circle_id) AND member_role <> 'elderly');
DROP POLICY IF EXISTS "members_delete_authorized" ON public.care_circle_members;
CREATE POLICY "members_delete_authorized" ON public.care_circle_members FOR DELETE
  USING ((has_circle_admin(care_circle_id) AND member_role <> 'elderly') OR (profile_id = auth.uid() AND member_role <> 'elderly'));

ALTER TABLE public.care_circle_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invitations_select_admins" ON public.care_circle_invitations;
CREATE POLICY "invitations_select_admins" ON public.care_circle_invitations FOR SELECT USING (has_circle_admin(care_circle_id));
DROP POLICY IF EXISTS "invitations_insert_admins" ON public.care_circle_invitations;
CREATE POLICY "invitations_insert_admins" ON public.care_circle_invitations FOR INSERT
  WITH CHECK (has_circle_admin(care_circle_id) AND created_by = auth.uid());
DROP POLICY IF EXISTS "invitations_update_admins" ON public.care_circle_invitations;
CREATE POLICY "invitations_update_admins" ON public.care_circle_invitations FOR UPDATE
  USING (has_circle_admin(care_circle_id)) WITH CHECK (has_circle_admin(care_circle_id));
DROP POLICY IF EXISTS "invitations_delete_admins" ON public.care_circle_invitations;
CREATE POLICY "invitations_delete_admins" ON public.care_circle_invitations FOR DELETE USING (has_circle_admin(care_circle_id));

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "medications_select_circle" ON public.medications;
CREATE POLICY "medications_select_circle" ON public.medications FOR SELECT USING (is_member_of_circle(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "medications_insert_write" ON public.medications;
CREATE POLICY "medications_insert_write" ON public.medications FOR INSERT
  WITH CHECK (created_by = auth.uid() AND has_circle_write(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "medications_update_write" ON public.medications;
CREATE POLICY "medications_update_write" ON public.medications FOR UPDATE
  USING (has_circle_write(get_circle_for_elderly(elderly_id))) WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "medications_delete_write" ON public.medications;
CREATE POLICY "medications_delete_write" ON public.medications FOR DELETE USING (has_circle_write(get_circle_for_elderly(elderly_id)));

ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "schedules_select_circle" ON public.medication_schedules;
CREATE POLICY "schedules_select_circle" ON public.medication_schedules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.medications m WHERE m.id = medication_schedules.medication_id AND is_member_of_circle(get_circle_for_elderly(m.elderly_id))));
DROP POLICY IF EXISTS "schedules_write_authorized" ON public.medication_schedules;
CREATE POLICY "schedules_write_authorized" ON public.medication_schedules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.medications m WHERE m.id = medication_schedules.medication_id AND has_circle_write(get_circle_for_elderly(m.elderly_id))));

ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doses_select_circle" ON public.medication_doses;
CREATE POLICY "doses_select_circle" ON public.medication_doses FOR SELECT USING (is_member_of_circle(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "doses_insert_write" ON public.medication_doses;
CREATE POLICY "doses_insert_write" ON public.medication_doses FOR INSERT WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "doses_update_authorized_actors" ON public.medication_doses;
CREATE POLICY "doses_update_authorized_actors" ON public.medication_doses FOR UPDATE
  USING (has_circle_write(get_circle_for_elderly(elderly_id)) OR EXISTS (
    SELECT 1 FROM public.care_circle_members ccm
    JOIN public.elderly_profiles ep ON ep.care_circle_id = ccm.care_circle_id
    WHERE ep.id = medication_doses.elderly_id AND ccm.profile_id = auth.uid() AND ccm.member_role IN ('elderly', 'caregiver') AND ccm.permissions IN ('write', 'admin')
  ))
  WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)) OR EXISTS (
    SELECT 1 FROM public.care_circle_members ccm
    JOIN public.elderly_profiles ep ON ep.care_circle_id = ccm.care_circle_id
    WHERE ep.id = medication_doses.elderly_id AND ccm.profile_id = auth.uid() AND ccm.member_role IN ('elderly', 'caregiver') AND ccm.permissions IN ('write', 'admin')
  ));
DROP POLICY IF EXISTS "doses_delete_denied" ON public.medication_doses;
CREATE POLICY "doses_delete_denied" ON public.medication_doses FOR DELETE USING (false);

ALTER TABLE public.medication_dose_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dose_history_select_circle" ON public.medication_dose_history;
CREATE POLICY "dose_history_select_circle" ON public.medication_dose_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.medication_doses d WHERE d.id = medication_dose_history.dose_id AND is_member_of_circle(get_circle_for_elderly(d.elderly_id))));
DROP POLICY IF EXISTS "dose_history_insert_denied_direct" ON public.medication_dose_history;
CREATE POLICY "dose_history_insert_denied_direct" ON public.medication_dose_history FOR INSERT WITH CHECK (false);
DROP POLICY IF EXISTS "dose_history_update_denied" ON public.medication_dose_history;
CREATE POLICY "dose_history_update_denied" ON public.medication_dose_history FOR UPDATE USING (false);
DROP POLICY IF EXISTS "dose_history_delete_denied" ON public.medication_dose_history;
CREATE POLICY "dose_history_delete_denied" ON public.medication_dose_history FOR DELETE USING (false);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointments_select_circle" ON public.appointments;
CREATE POLICY "appointments_select_circle" ON public.appointments FOR SELECT USING (is_member_of_circle(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "appointments_insert_write" ON public.appointments;
CREATE POLICY "appointments_insert_write" ON public.appointments FOR INSERT
  WITH CHECK (created_by = auth.uid() AND has_circle_write(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "appointments_update_write" ON public.appointments;
CREATE POLICY "appointments_update_write" ON public.appointments FOR UPDATE
  USING (has_circle_write(get_circle_for_elderly(elderly_id))) WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "appointments_delete_write" ON public.appointments;
CREATE POLICY "appointments_delete_write" ON public.appointments FOR DELETE USING (has_circle_write(get_circle_for_elderly(elderly_id)));

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
CREATE POLICY "notifications_select_recipient" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_recipient" ON public.notifications;
CREATE POLICY "notifications_update_recipient" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
DROP POLICY IF EXISTS "notifications_insert_circle" ON public.notifications;
CREATE POLICY "notifications_insert_circle" ON public.notifications FOR INSERT WITH CHECK (is_member_of_circle(get_circle_for_elderly(elderly_id)));
DROP POLICY IF EXISTS "notifications_delete_recipient" ON public.notifications;
CREATE POLICY "notifications_delete_recipient" ON public.notifications FOR DELETE USING (recipient_id = auth.uid());

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_select_circle" ON public.activity_logs;
CREATE POLICY "activity_select_circle" ON public.activity_logs FOR SELECT USING (is_member_of_circle(care_circle_id));
DROP POLICY IF EXISTS "activity_insert_member" ON public.activity_logs;
CREATE POLICY "activity_insert_member" ON public.activity_logs FOR INSERT
  WITH CHECK (performed_by = auth.uid() AND is_member_of_circle(care_circle_id));
DROP POLICY IF EXISTS "activity_delete_denied" ON public.activity_logs;
CREATE POLICY "activity_delete_denied" ON public.activity_logs FOR DELETE USING (false);
