-- ==============================================================================
-- SAHAAYA DATABASE MIGRATION 003: COMPLETE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_peers"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.care_circle_members m1
      JOIN public.care_circle_members m2 ON m1.care_circle_id = m2.care_circle_id
      WHERE m1.profile_id = auth.uid() AND m2.profile_id = profiles.id
    )
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_delete_denied"
  ON public.profiles FOR DELETE
  USING (false);

-- ------------------------------------------------------------------------------
-- 2. CARE CIRCLES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.care_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "circles_select_members"
  ON public.care_circles FOR SELECT
  USING (is_member_of_circle(id) OR created_by = auth.uid());

-- Direct client INSERT is denied; must use create_care_circle_atomic
CREATE POLICY "circles_insert_denied_direct"
  ON public.care_circles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "circles_update_admins"
  ON public.care_circles FOR UPDATE
  USING (has_circle_admin(id))
  WITH CHECK (has_circle_admin(id));

CREATE POLICY "circles_delete_denied"
  ON public.care_circles FOR DELETE
  USING (false);

-- ------------------------------------------------------------------------------
-- 3. ELDERLY PROFILES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.elderly_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "elderly_select_members"
  ON public.elderly_profiles FOR SELECT
  USING (is_member_of_circle(care_circle_id) OR profile_id = auth.uid());

-- Direct client INSERT denied; must use create_care_circle_atomic
CREATE POLICY "elderly_insert_denied_direct"
  ON public.elderly_profiles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "elderly_update_authorized"
  ON public.elderly_profiles FOR UPDATE
  USING (profile_id = auth.uid() OR has_circle_write(care_circle_id))
  WITH CHECK (profile_id = auth.uid() OR has_circle_write(care_circle_id));

CREATE POLICY "elderly_delete_denied"
  ON public.elderly_profiles FOR DELETE
  USING (false);

-- ------------------------------------------------------------------------------
-- 4. CARE CIRCLE MEMBERS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.care_circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select_peers"
  ON public.care_circle_members FOR SELECT
  USING (is_member_of_circle(care_circle_id));

-- Direct INSERT denied to prevent self-addition; handled via atomic procedures
CREATE POLICY "members_insert_denied_direct"
  ON public.care_circle_members FOR INSERT
  WITH CHECK (false);

-- Only Admins can modify permissions; cannot demote primary elderly
CREATE POLICY "members_update_admins"
  ON public.care_circle_members FOR UPDATE
  USING (has_circle_admin(care_circle_id) AND member_role <> 'elderly')
  WITH CHECK (has_circle_admin(care_circle_id) AND member_role <> 'elderly');

-- Admins can remove members (except elderly); members can remove themselves
CREATE POLICY "members_delete_authorized"
  ON public.care_circle_members FOR DELETE
  USING (
    (has_circle_admin(care_circle_id) AND member_role <> 'elderly') OR
    (profile_id = auth.uid() AND member_role <> 'elderly')
  );

-- ------------------------------------------------------------------------------
-- 5. CARE CIRCLE INVITATIONS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.care_circle_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can inspect invitations for their circle
CREATE POLICY "invitations_select_admins"
  ON public.care_circle_invitations FOR SELECT
  USING (has_circle_admin(care_circle_id));

CREATE POLICY "invitations_insert_admins"
  ON public.care_circle_invitations FOR INSERT
  WITH CHECK (
    has_circle_admin(care_circle_id) AND 
    created_by = auth.uid()
  );

CREATE POLICY "invitations_update_admins"
  ON public.care_circle_invitations FOR UPDATE
  USING (has_circle_admin(care_circle_id))
  WITH CHECK (has_circle_admin(care_circle_id));

CREATE POLICY "invitations_delete_admins"
  ON public.care_circle_invitations FOR DELETE
  USING (has_circle_admin(care_circle_id));

-- ------------------------------------------------------------------------------
-- 6. MEDICATIONS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medications_select_circle"
  ON public.medications FOR SELECT
  USING (is_member_of_circle(get_circle_for_elderly(elderly_id)));

CREATE POLICY "medications_insert_write"
  ON public.medications FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    has_circle_write(get_circle_for_elderly(elderly_id))
  );

CREATE POLICY "medications_update_write"
  ON public.medications FOR UPDATE
  USING (has_circle_write(get_circle_for_elderly(elderly_id)))
  WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)));

CREATE POLICY "medications_delete_write"
  ON public.medications FOR DELETE
  USING (has_circle_write(get_circle_for_elderly(elderly_id)));

-- ------------------------------------------------------------------------------
-- 7. MEDICATION SCHEDULES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_select_circle"
  ON public.medication_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.medications m
      WHERE m.id = medication_schedules.medication_id
        AND is_member_of_circle(get_circle_for_elderly(m.elderly_id))
    )
  );

CREATE POLICY "schedules_write_authorized"
  ON public.medication_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.medications m
      WHERE m.id = medication_schedules.medication_id
        AND has_circle_write(get_circle_for_elderly(m.elderly_id))
    )
  );

-- ------------------------------------------------------------------------------
-- 8. MEDICATION DOSES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doses_select_circle"
  ON public.medication_doses FOR SELECT
  USING (is_member_of_circle(get_circle_for_elderly(elderly_id)));

CREATE POLICY "doses_insert_write"
  ON public.medication_doses FOR INSERT
  WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)));

-- READ-ONLY MEMBERS ARE BLOCKED! ONLY ELDERLY, WRITE FAMILY, OR ASSIGNED CAREGIVERS CAN RECORD A DOSE
CREATE POLICY "doses_update_authorized_actors"
  ON public.medication_doses FOR UPDATE
  USING (
    has_circle_write(get_circle_for_elderly(elderly_id)) OR
    EXISTS (
      SELECT 1 FROM public.care_circle_members ccm
      JOIN public.elderly_profiles ep ON ep.care_circle_id = ccm.care_circle_id
      WHERE ep.id = medication_doses.elderly_id
        AND ccm.profile_id = auth.uid()
        AND ccm.member_role IN ('elderly', 'caregiver')
        AND ccm.permissions IN ('write', 'admin')
    )
  )
  WITH CHECK (
    has_circle_write(get_circle_for_elderly(elderly_id)) OR
    EXISTS (
      SELECT 1 FROM public.care_circle_members ccm
      JOIN public.elderly_profiles ep ON ep.care_circle_id = ccm.care_circle_id
      WHERE ep.id = medication_doses.elderly_id
        AND ccm.profile_id = auth.uid()
        AND ccm.member_role IN ('elderly', 'caregiver')
        AND ccm.permissions IN ('write', 'admin')
    )
  );

CREATE POLICY "doses_delete_denied"
  ON public.medication_doses FOR DELETE
  USING (false);

-- ------------------------------------------------------------------------------
-- 9. MEDICATION DOSE HISTORY TABLE (IMMUTABLE AUDIT TRAIL)
-- ------------------------------------------------------------------------------
ALTER TABLE public.medication_dose_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dose_history_select_circle"
  ON public.medication_dose_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.medication_doses d
      WHERE d.id = medication_dose_history.dose_id
        AND is_member_of_circle(get_circle_for_elderly(d.elderly_id))
    )
  );

-- Direct client modifications are strictly DENIED
CREATE POLICY "dose_history_insert_denied_direct"
  ON public.medication_dose_history FOR INSERT
  WITH CHECK (false);

CREATE POLICY "dose_history_update_denied"
  ON public.medication_dose_history FOR UPDATE
  USING (false);

CREATE POLICY "dose_history_delete_denied"
  ON public.medication_dose_history FOR DELETE
  USING (false);

-- ------------------------------------------------------------------------------
-- 10. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select_circle"
  ON public.appointments FOR SELECT
  USING (is_member_of_circle(get_circle_for_elderly(elderly_id)));

CREATE POLICY "appointments_insert_write"
  ON public.appointments FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    has_circle_write(get_circle_for_elderly(elderly_id))
  );

CREATE POLICY "appointments_update_write"
  ON public.appointments FOR UPDATE
  USING (has_circle_write(get_circle_for_elderly(elderly_id)))
  WITH CHECK (has_circle_write(get_circle_for_elderly(elderly_id)));

CREATE POLICY "appointments_delete_write"
  ON public.appointments FOR DELETE
  USING (has_circle_write(get_circle_for_elderly(elderly_id)));

-- ------------------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_recipient"
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "notifications_update_recipient"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "notifications_insert_circle"
  ON public.notifications FOR INSERT
  WITH CHECK (is_member_of_circle(get_circle_for_elderly(elderly_id)));

CREATE POLICY "notifications_delete_recipient"
  ON public.notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 12. ACTIVITY LOGS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_select_circle"
  ON public.activity_logs FOR SELECT
  USING (is_member_of_circle(care_circle_id));

CREATE POLICY "activity_insert_member"
  ON public.activity_logs FOR INSERT
  WITH CHECK (performed_by = auth.uid() AND is_member_of_circle(care_circle_id));

CREATE POLICY "activity_delete_denied"
  ON public.activity_logs FOR DELETE
  USING (false);
