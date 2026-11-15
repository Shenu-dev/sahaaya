-- ==============================================================================
-- SAARTHI DATABASE MIGRATION 002: HARDENED STORED PROCEDURES & TRIGGERS
-- ==============================================================================

-- 1. Automatic User Profile Provisioning Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Saarthi User'),
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

-- 2. Automatic Dose Status Audit History Trigger
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

-- 3. Prevent Medication Hard Delete (Enforces Archiving)
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

-- 4. RLS Helper Functions
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

-- 5. Atomic Care Circle Creation Procedure
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

  -- 1. Create the Care Circle
  INSERT INTO public.care_circles (name, created_by)
  VALUES (p_circle_name, v_user_id)
  RETURNING id INTO v_circle_id;

  -- 2. Create the Elderly Profile
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

  -- 3. Link Care Circle primary elderly
  UPDATE public.care_circles SET primary_elderly_id = v_elderly_id WHERE id = v_circle_id;

  -- 4. Add the creator as the founding Admin Member
  INSERT INTO public.care_circle_members (
    care_circle_id, profile_id, member_role, permissions, relationship_label
  ) VALUES (
    v_circle_id, v_user_id, p_user_role, 'admin', v_member_label
  );

  -- 5. Log activity
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

-- 6. Atomic Cryptographic Invitation Acceptance
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

  -- Atomic row lock to prevent race conditions or double-use
  SELECT * INTO v_invitation
  FROM public.care_circle_invitations
  WHERE token_hash = p_token_hash
    AND status = 'pending'
    AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, expired, or already used invitation.';
  END IF;

  -- Strict email verification
  IF LOWER(v_invitation.invited_email) <> LOWER(v_user_email) THEN
    RAISE EXCEPTION 'This invitation was issued to % and cannot be accepted by %.', v_invitation.invited_email, v_user_email;
  END IF;

  -- Add to Care Circle Members
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

  -- Mark invitation accepted atomically
  UPDATE public.care_circle_invitations
  SET status = 'accepted', accepted_by = v_user_id, accepted_at = NOW()
  WHERE id = v_invitation.id;

  -- Log Activity
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

-- 7. Authorized & Idempotent Dose Generation Procedure
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

  -- Caller must belong to the circle
  IF NOT EXISTS (
    SELECT 1 FROM public.care_circle_members
    WHERE care_circle_id = v_circle_id AND profile_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this Care Circle.';
  END IF;

  v_day_of_week := EXTRACT(DOW FROM p_target_date);

  -- Idempotent generation with ON CONFLICT DO NOTHING
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

-- 8. Authorized Missed-Dose Evaluator & In-App Alert Trigger
CREATE OR REPLACE FUNCTION public.evaluate_missed_doses(p_elderly_id UUID)
RETURNS INT
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_circle_id UUID;
  v_tz TEXT;
  v_today DATE;
  v_now_time TIME;
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
  v_today := (NOW() AT TIME ZONE v_tz)::DATE;
  v_now_time := (NOW() AT TIME ZONE v_tz)::TIME;

  -- Overdue upcoming doses past 60 min threshold
  FOR r_dose IN 
    SELECT d.id, d.elderly_id, m.name AS med_name, d.scheduled_time
    FROM public.medication_doses d
    JOIN public.medications m ON m.id = d.medication_id
    WHERE d.elderly_id = p_elderly_id
      AND d.status = 'upcoming'
      AND (
        d.dose_date < v_today OR 
        (d.dose_date = v_today AND d.scheduled_time < (v_now_time - INTERVAL '60 minutes'))
      )
  LOOP
    -- Updating status automatically fires trg_medication_dose_history
    UPDATE public.medication_doses
    SET status = 'missed', updated_at = NOW()
    WHERE id = r_dose.id;

    -- Create notification alert for circle members
    INSERT INTO public.notifications (recipient_id, elderly_id, type, title, message)
    SELECT 
      ccm.profile_id,
      p_elderly_id,
      'dose_missed',
      'Missed Medication Alert',
      r_dose.med_name || ' scheduled for ' || r_dose.scheduled_time || ' was marked as missed.'
    FROM public.care_circle_members ccm
    WHERE ccm.care_circle_id = v_circle_id;

    v_updated_count := v_updated_count + 1;
  END LOOP;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.evaluate_missed_doses(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evaluate_missed_doses(UUID) TO authenticated;
