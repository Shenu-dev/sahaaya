-- ==============================================================================
-- SAARTHI DATABASE MIGRATION 004: SEED REALISTIC DEMO DATA
-- ==============================================================================

DO $$
DECLARE
  v_circle_id UUID := '11111111-1111-1111-1111-111111111111';
  v_elderly_id UUID := '22222222-2222-2222-2222-222222222222';
  
  v_elderly_user_id UUID;
  v_family_user_id UUID;
  v_caregiver_user_id UUID;
  
  v_med1_id UUID := '33333333-3333-3333-3333-333333333331';
  v_med2_id UUID := '33333333-3333-3333-3333-333333333332';
  v_med3_id UUID := '33333333-3333-3333-3333-333333333333';
  
  v_sched1_id UUID := '44444444-4444-4444-4444-444444444441';
  v_sched2_id UUID := '44444444-4444-4444-4444-444444444442';
  v_sched3_id UUID := '44444444-4444-4444-4444-444444444443';
BEGIN
  -- Look up existing auth user IDs if created, otherwise pick fallback UUIDs
  SELECT id INTO v_elderly_user_id FROM auth.users WHERE email = 'kamla.elderly@saarthi.demo';
  SELECT id INTO v_family_user_id FROM auth.users WHERE email = 'rohan.family@saarthi.demo';
  SELECT id INTO v_caregiver_user_id FROM auth.users WHERE email = 'priya.nurse@saarthi.demo';

  IF v_elderly_user_id IS NULL THEN
    v_elderly_user_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  END IF;
  IF v_family_user_id IS NULL THEN
    v_family_user_id := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  END IF;
  IF v_caregiver_user_id IS NULL THEN
    v_caregiver_user_id := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  END IF;

  -- 1. Ensure Profile Rows Exist
  INSERT INTO public.profiles (id, full_name, email, role, phone)
  VALUES 
    (v_elderly_user_id, 'Kamla Sharma', 'kamla.elderly@saarthi.demo', 'elderly', '+91 98765 43210'),
    (v_family_user_id, 'Rohan Sharma', 'rohan.family@saarthi.demo', 'family', '+91 98765 43211'),
    (v_caregiver_user_id, 'Nurse Priya Rao', 'priya.nurse@saarthi.demo', 'caregiver', '+91 98765 43212')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  -- 2. Demo Care Circle
  INSERT INTO public.care_circles (id, name, created_by, is_demo)
  VALUES (v_circle_id, 'Sharma Family Care Circle', v_elderly_user_id, TRUE)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_demo = TRUE;

  -- 3. Elderly Healthcare Profile
  INSERT INTO public.elderly_profiles (
    id, profile_id, care_circle_id, full_name, date_of_birth, gender, blood_group,
    allergies, medical_conditions, emergency_contact_name, emergency_contact_phone,
    emergency_contact_relation, primary_doctor_name, primary_doctor_phone, timezone
  ) VALUES (
    v_elderly_id, v_elderly_user_id, v_circle_id, 'Kamla Sharma', '1952-08-15', 'Female', 'B+',
    'Penicillin, Aspirin (Mild rash)', 'Hypertension, Type-2 Diabetes, Mild Osteoarthritis',
    'Rohan Sharma (Son)', '+91 98765 43211', 'Son',
    'Dr. Rajiv Verma (Cardiologist)', '+91 98111 22334', 'Asia/Kolkata'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    allergies = EXCLUDED.allergies,
    medical_conditions = EXCLUDED.medical_conditions;

  UPDATE public.care_circles SET primary_elderly_id = v_elderly_id WHERE id = v_circle_id;

  -- 4. Care Circle Memberships
  INSERT INTO public.care_circle_members (care_circle_id, profile_id, member_role, permissions, relationship_label)
  VALUES 
    (v_circle_id, v_elderly_user_id, 'elderly', 'admin', 'Self (Mother)'),
    (v_circle_id, v_family_user_id, 'family', 'admin', 'Son (Primary Admin)'),
    (v_circle_id, v_caregiver_user_id, 'caregiver', 'write', 'Visiting Care Nurse')
  ON CONFLICT (care_circle_id, profile_id) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    relationship_label = EXCLUDED.relationship_label;

  -- 5. Prescribed Medications
  INSERT INTO public.medications (id, elderly_id, name, dosage, form, instructions, start_date, is_active, created_by)
  VALUES
    (v_med1_id, v_elderly_id, 'Amlodipine Besylate', '5 mg', 'tablet', 'Take with warm water 30 minutes after breakfast.', CURRENT_DATE - 30, TRUE, v_elderly_user_id),
    (v_med2_id, v_elderly_id, 'Metformin HCl ER', '500 mg', 'tablet', 'Take with lunch. Do not crush or chew.', CURRENT_DATE - 60, TRUE, v_elderly_user_id),
    (v_med3_id, v_elderly_id, 'Atorvastatin Calcium', '10 mg', 'tablet', 'Take at bedtime for cholesterol management.', CURRENT_DATE - 90, TRUE, v_elderly_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Medication Schedules
  INSERT INTO public.medication_schedules (id, medication_id, scheduled_time, frequency_type, days_of_week, dose_quantity)
  VALUES
    (v_sched1_id, v_med1_id, '08:00:00', 'daily', '{0,1,2,3,4,5,6}', 1.0),
    (v_sched2_id, v_med2_id, '13:00:00', 'daily', '{0,1,2,3,4,5,6}', 1.0),
    (v_sched3_id, v_med3_id, '21:00:00', 'daily', '{0,1,2,3,4,5,6}', 1.0)
  ON CONFLICT (id) DO NOTHING;

  -- 7. Today's Seed Doses (Demonstrating distinct states)
  INSERT INTO public.medication_doses (schedule_id, medication_id, elderly_id, dose_date, scheduled_time, status, recorded_at, recorded_by, notes)
  VALUES
    (v_sched1_id, v_med1_id, v_elderly_id, CURRENT_DATE, '08:00:00', 'taken', NOW() - INTERVAL '3 hours', v_elderly_user_id, 'Taken after breakfast'),
    (v_sched2_id, v_med2_id, v_elderly_id, CURRENT_DATE, '13:00:00', 'upcoming', NULL, NULL, NULL),
    (v_sched3_id, v_med3_id, v_elderly_id, CURRENT_DATE, '21:00:00', 'upcoming', NULL, NULL, NULL)
  ON CONFLICT (schedule_id, dose_date, scheduled_time) DO UPDATE SET
    status = EXCLUDED.status;

  -- 8. Upcoming Doctor Appointments
  INSERT INTO public.appointments (elderly_id, doctor_name, specialty, clinic_or_hospital, appointment_time, status, notes, created_by)
  VALUES
    (v_elderly_id, 'Dr. Rajiv Verma', 'Cardiology Review', 'Apollo Specialty Clinic, Room 304', NOW() + INTERVAL '2 days', 'upcoming', 'Bring latest ECG report and 30-day blood pressure log.', v_family_user_id),
    (v_elderly_id, 'Dr. Sunita Patel', 'Diabetology Follow-up', 'City Healthcare Center', NOW() + INTERVAL '12 days', 'upcoming', 'Fasting blood glucose test required prior to consultation.', v_family_user_id)
  ON CONFLICT DO NOTHING;

  -- 9. Activity Logs
  INSERT INTO public.activity_logs (care_circle_id, elderly_id, performed_by, action_type, description)
  VALUES
    (v_circle_id, v_elderly_id, v_elderly_user_id, 'dose_taken', 'Kamla Sharma marked morning dose of Amlodipine 5mg as TAKEN.'),
    (v_circle_id, v_elderly_id, v_family_user_id, 'appointment_created', 'Rohan Sharma scheduled Cardiology Review with Dr. Rajiv Verma.')
  ON CONFLICT DO NOTHING;

END $$;
