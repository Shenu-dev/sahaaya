-- ==============================================================================
-- SAHAAYA DATABASE MIGRATION 006: FIX MISSED-DOSE EVALUATOR MIDNIGHT WRAPAROUND
-- ==============================================================================
-- Fixes SEC-CRIT-01: Replaces TIME subtraction with combined TIMESTAMP comparison
-- to prevent 24-hour wraparound past midnight (00:00 - 01:00 AM) that falsely
-- marked upcoming daytime doses as missed.

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
  
  -- Current timestamp localized to the patient's timezone
  v_current_tz_timestamp := (NOW() AT TIME ZONE v_tz);

  -- Correctly compare combined date and scheduled time timestamp
  -- against the current localized time minus the 60-minute grace window.
  -- This permanently resolves the TIME wraparound bug between 00:00 and 01:00.
  FOR r_dose IN 
    SELECT d.id, d.elderly_id, m.name AS med_name, d.scheduled_time, d.dose_date
    FROM public.medication_doses d
    JOIN public.medications m ON m.id = d.medication_id
    WHERE d.elderly_id = p_elderly_id
      AND d.status = 'upcoming'
      AND (d.dose_date + d.scheduled_time) < (v_current_tz_timestamp - INTERVAL '60 minutes')
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
