-- ============================================================
-- HealthLuma — Row Level Security Policies
-- Safe to re-run: drops all existing policies first.
-- Run AFTER schema.sql has been applied.
-- ============================================================

-- ── DROP EXISTING POLICIES (clean slate) ────────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ── DROP & RECREATE HELPER FUNCTIONS ────────────────────────

DROP FUNCTION IF EXISTS public.is_doctor();
DROP FUNCTION IF EXISTS public.is_patient();

-- Returns true if the current user has role = 'doctor'
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'doctor'
  );
$$;

-- Returns true if the current user has role = 'patient'
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'patient'
  );
$$;


-- ── ENABLE RLS ON ALL TABLES ─────────────────────────────────

ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
-- webhook_events: no RLS — only accessible via service_role key


-- ============================================================
-- TABLE: users
-- Patients read/update their own row.
-- Doctors read all patient rows (needed for patient management).
-- ============================================================

CREATE POLICY "users__patient_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users__patient_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: blocks role column changes from authenticated sessions.
-- Service-role / direct DB access (no JWT) is allowed through.
-- Must be created here so a fresh rls.sql run also installs it.
CREATE OR REPLACE FUNCTION public.guard_role_escalation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  jwt_claims jsonb;
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    jwt_claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
    IF jwt_claims IS NOT NULL
       AND (jwt_claims->>'role') IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'permission_denied: role cannot be changed through this interface.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_role_escalation ON public.users;
CREATE TRIGGER guard_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_role_escalation();

-- Allows trigger function (handle_new_user) to insert.
-- The trigger runs as SECURITY DEFINER so no insert policy is needed
-- for normal auth signups. This policy allows service_role inserts if needed.
CREATE POLICY "users__service_insert"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Doctor reads all users (needed to look up patient names, list patients)
CREATE POLICY "users__doctor_select_all"
  ON public.users FOR SELECT
  USING (public.is_doctor());


-- ============================================================
-- TABLE: family_members
-- Patients manage their own family list.
-- Doctors can read all (needed to see who appointment was booked for).
-- ============================================================

CREATE POLICY "family_members__patient_select_own"
  ON public.family_members FOR SELECT
  USING (primary_user_id = auth.uid());

CREATE POLICY "family_members__patient_insert_own"
  ON public.family_members FOR INSERT
  WITH CHECK (primary_user_id = auth.uid());

CREATE POLICY "family_members__patient_update_own"
  ON public.family_members FOR UPDATE
  USING (primary_user_id = auth.uid())
  WITH CHECK (primary_user_id = auth.uid());

CREATE POLICY "family_members__patient_delete_own"
  ON public.family_members FOR DELETE
  USING (primary_user_id = auth.uid());

CREATE POLICY "family_members__doctor_select_all"
  ON public.family_members FOR SELECT
  USING (public.is_doctor());


-- ============================================================
-- TABLE: doctor_availability
-- All authenticated users can read (needed to render booking calendar).
-- Only the doctor can manage their own schedule.
-- ============================================================

CREATE POLICY "doctor_availability__authenticated_select"
  ON public.doctor_availability FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "doctor_availability__doctor_insert"
  ON public.doctor_availability FOR INSERT
  WITH CHECK (doctor_id = auth.uid() AND public.is_doctor());

CREATE POLICY "doctor_availability__doctor_update"
  ON public.doctor_availability FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "doctor_availability__doctor_delete"
  ON public.doctor_availability FOR DELETE
  USING (doctor_id = auth.uid());


-- ============================================================
-- TABLE: appointments
-- Patients view and create their own appointments.
-- Patients cannot update or delete (reschedule goes through a new booking).
-- Doctors have full access to all appointments.
-- ============================================================

CREATE POLICY "appointments__patient_select_own"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "appointments__patient_insert"
  ON public.appointments FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
    -- Ensure the family_member (if provided) belongs to this patient
    AND (
      family_member_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.family_members fm
        WHERE fm.id = family_member_id
          AND fm.primary_user_id = auth.uid()
      )
    )
  );

-- Patient can only cancel their own upcoming appointment
CREATE POLICY "appointments__patient_cancel"
  ON public.appointments FOR UPDATE
  USING (
    patient_id = auth.uid()
    AND status = 'upcoming'
  )
  WITH CHECK (
    patient_id = auth.uid()
    AND status = 'cancelled'   -- Only allowed transition for patients
  );

-- Scoped to doctor_id = auth.uid() — not is_doctor() (which is too broad)
CREATE POLICY "appointments__doctor_select"
  ON public.appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "appointments__doctor_update"
  ON public.appointments FOR UPDATE
  USING  (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());


-- ============================================================
-- TABLE: prescriptions
-- Patients read only their own prescriptions.
-- Doctors have full read/write access.
-- ============================================================

CREATE POLICY "prescriptions__patient_select_own"
  ON public.prescriptions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "prescriptions__doctor_select_all"
  ON public.prescriptions FOR SELECT
  USING (public.is_doctor());

CREATE POLICY "prescriptions__doctor_insert"
  ON public.prescriptions FOR INSERT
  WITH CHECK (doctor_id = auth.uid() AND public.is_doctor());

CREATE POLICY "prescriptions__doctor_update"
  ON public.prescriptions FOR UPDATE
  USING (public.is_doctor());

-- No delete — prescriptions are a permanent medical record.
-- Use status = 'discontinued' instead.


-- ============================================================
-- TABLE: documents
-- Patients read and upload their own documents.
-- Doctors have full access (to upload consultation notes, read all).
-- ============================================================

CREATE POLICY "documents__patient_select_own"
  ON public.documents FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "documents__patient_insert_own"
  ON public.documents FOR INSERT
  WITH CHECK (
    patient_id  = auth.uid()
    AND uploaded_by = auth.uid()
  );

-- Patients can delete documents they uploaded themselves
CREATE POLICY "documents__patient_delete_own_uploads"
  ON public.documents FOR DELETE
  USING (
    patient_id  = auth.uid()
    AND uploaded_by = auth.uid()
  );

-- Scoped to doctor's own patients via appointments relationship
CREATE POLICY "documents__doctor_select"
  ON public.documents FOR SELECT
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = documents.patient_id
        AND a.doctor_id  = auth.uid()
    )
  );

CREATE POLICY "documents__doctor_insert"
  ON public.documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = documents.patient_id
        AND a.doctor_id  = auth.uid()
    )
  );


-- ============================================================
-- TABLE: vitals
-- Patients read only their own vitals.
-- Doctors read and record vitals for all patients.
-- ============================================================

CREATE POLICY "vitals__patient_select_own"
  ON public.vitals FOR SELECT
  USING (patient_id = auth.uid());

-- Scoped via recorded_by (doctor who took the reading)
CREATE POLICY "vitals__doctor_select"
  ON public.vitals FOR SELECT
  USING (recorded_by = auth.uid());

CREATE POLICY "vitals__doctor_insert"
  ON public.vitals FOR INSERT
  WITH CHECK (
    recorded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.patient_id = vitals.patient_id
        AND a.doctor_id  = auth.uid()
    )
  );

CREATE POLICY "vitals__doctor_update"
  ON public.vitals FOR UPDATE
  USING  (recorded_by = auth.uid())
  WITH CHECK (recorded_by = auth.uid());


-- ============================================================
-- TABLE: clinical_notes
-- DELIBERATELY hidden from patients.
-- These are internal doctor notes — patients see documents instead.
-- ============================================================

CREATE POLICY "clinical_notes__doctor_full_access"
  ON public.clinical_notes FOR ALL
  USING (public.is_doctor());

-- No patient policy. Patients cannot read, write, or even detect
-- that clinical_notes exists for them.


-- ============================================================
-- TABLE: subscriptions
-- Patients read their own subscription status.
-- Doctors read all (for billing dashboard / Pro member list).
-- Writes happen via Stripe webhook using service_role — no insert policy needed.
-- ============================================================

CREATE POLICY "subscriptions__patient_select_own"
  ON public.subscriptions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "subscriptions__doctor_select_all"
  ON public.subscriptions FOR SELECT
  USING (public.is_doctor());

-- No patient insert/update — subscriptions are created by Stripe webhook only.


-- ============================================================
-- TABLE: payments
-- Patients read their own payment history (invoice list).
-- Doctors read all (for revenue tracking).
-- Writes happen via Stripe webhook using service_role only.
-- ============================================================

CREATE POLICY "payments__patient_select_own"
  ON public.payments FOR SELECT
  USING (patient_id = auth.uid());

-- payments has no doctor_id column — access is via the appointments join.
-- Membership payments (appointment_id IS NULL) are service_role only.
CREATE POLICY "payments__doctor_select"
  ON public.payments FOR SELECT
  USING (
    appointment_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id        = payments.appointment_id
        AND a.doctor_id = auth.uid()
    )
  );

-- No patient or doctor insert/update — payments are written by webhook only.
-- Service_role bypasses RLS and handles this.


-- ============================================================
-- TABLE: conversations (AI assistant)
-- Patients fully own their own conversations.
-- Doctors have no access (AI is patient-facing only).
-- ============================================================

CREATE POLICY "conversations__patient_full_access"
  ON public.conversations FOR ALL
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());


-- ============================================================
-- TABLE: messages (AI assistant)
-- Access is scoped through the parent conversation.
-- ============================================================

CREATE POLICY "messages__patient_full_access"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.patient_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.patient_id = auth.uid()
    )
  );


-- ============================================================
-- TABLE: doctor_tasks
-- Only the doctor who owns the task can access it.
-- No patient access whatsoever.
-- ============================================================

CREATE POLICY "doctor_tasks__doctor_full_access"
  ON public.doctor_tasks FOR ALL
  USING (doctor_id = auth.uid() AND public.is_doctor())
  WITH CHECK (doctor_id = auth.uid() AND public.is_doctor());


-- ============================================================
-- TABLE: announcements
-- Doctors manage their own announcements.
-- Patients can read published announcements (read-only).
-- ============================================================

CREATE POLICY "announcements__doctor_full_access"
  ON public.announcements FOR ALL
  USING (doctor_id = auth.uid() AND public.is_doctor());

-- If migration 20260320000010 has been applied, uses status + audience columns.
-- Otherwise falls back to the simple published boolean.
-- This makes rls.sql safe to run regardless of migration order.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'announcements'
      AND column_name  = 'status'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "announcements__patient_select_published"
        ON public.announcements FOR SELECT
        USING (
          status = 'published'
          AND public.is_patient()
          AND (
            audience = 'all'
            OR (
              audience = 'pro'
              AND EXISTS (
                SELECT 1 FROM public.subscriptions s
                WHERE s.patient_id = auth.uid()
                  AND s.status = 'active'
              )
            )
          )
        )
    $policy$;
  ELSE
    EXECUTE $policy$
      CREATE POLICY "announcements__patient_select_published"
        ON public.announcements FOR SELECT
        USING (published = true AND public.is_patient())
    $policy$;
  END IF;
END;
$$;


-- ============================================================
-- TABLE: notifications
-- Users can only see and manage their own notifications.
-- System creates them via service_role (no insert policy needed).
-- ============================================================

CREATE POLICY "notifications__own_select"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Allow user to mark as read (update read_at only)
CREATE POLICY "notifications__own_update"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications__own_delete"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- VERIFICATION QUERIES
-- Run these to confirm policies are active.
-- ============================================================

-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
