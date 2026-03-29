-- ============================================================
-- HealthLuma — Tighten RLS Scope
-- Date: 2026-03-30
--
-- PROBLEMS FIXED:
--
--   1. appointments__doctor_full_access
--      USING (is_doctor()) let ANY doctor read/update ANY appointment.
--      Replaced with two policies scoped to doctor_id = auth.uid().
--
--   2. documents__doctor_full_access
--      USING (is_doctor()) let ANY doctor read/write ANY document.
--      Replaced with policies scoped to the doctor's own patients
--      (determined via the appointments relationship).
--
--   3. vitals__doctor_full_access
--      USING (is_doctor()) let ANY doctor read/write ANY vital.
--      Replaced with policies scoped via the recorded_by column.
--
--   4. Role self-escalation on users table
--      users__patient_update_own had no guard on the role column.
--      A BEFORE UPDATE trigger now blocks role changes for regular
--      authenticated sessions (JWT role = 'authenticated').
--      Service-role and direct DB access (no JWT) are still allowed.
--
--   5. payments policy conflict
--      Migration 20260328000001 created "payments: user can read own"
--      referencing a doctor_id column that does NOT exist on payments.
--      That policy is dropped. payments__doctor_select_all (any doctor
--      sees all payments) is also replaced with an appointment-scoped
--      version — the only correct path to the doctor relationship.
--
--   6. announcements patient policy out of sync
--      rls.sql checks published = true but migration 20260320000010
--      added a status column and audience gating. Policy updated to
--      match.
--
-- SAFE TO RE-RUN: all statements use DROP IF EXISTS / OR REPLACE.
-- ============================================================


-- ── 1. appointments ───────────────────────────────────────────────

-- Drop the overbroad "any doctor" policy
DROP POLICY IF EXISTS "appointments__doctor_full_access" ON public.appointments;

-- Drop older narrower policies from migration 005 to avoid name collision
DROP POLICY IF EXISTS "appointments__doctor_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments__doctor_update" ON public.appointments;

-- Doctor reads only their own assigned appointments
CREATE POLICY "appointments__doctor_select"
  ON public.appointments FOR SELECT
  USING (doctor_id = auth.uid());

-- Doctor updates only their own appointments (status, notes)
CREATE POLICY "appointments__doctor_update"
  ON public.appointments FOR UPDATE
  USING  (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());


-- ── 2. documents ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "documents__doctor_full_access" ON public.documents;
DROP POLICY IF EXISTS "documents__doctor_select"       ON public.documents;
DROP POLICY IF EXISTS "documents__doctor_insert"       ON public.documents;

-- Doctor reads documents they uploaded OR documents for patients who
-- have at least one appointment with this doctor
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

-- Doctor uploads documents for patients they have an appointment with
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


-- ── 3. vitals ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "vitals__doctor_full_access" ON public.vitals;
DROP POLICY IF EXISTS "vitals__doctor_select"       ON public.vitals;
DROP POLICY IF EXISTS "vitals__doctor_insert"       ON public.vitals;
DROP POLICY IF EXISTS "vitals__doctor_update"       ON public.vitals;

-- Doctor reads vitals they personally recorded
CREATE POLICY "vitals__doctor_select"
  ON public.vitals FOR SELECT
  USING (recorded_by = auth.uid());

-- Doctor inserts vitals only for their own patients
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

-- Doctor updates vitals they recorded
CREATE POLICY "vitals__doctor_update"
  ON public.vitals FOR UPDATE
  USING  (recorded_by = auth.uid())
  WITH CHECK (recorded_by = auth.uid());


-- ── 4. Prevent role self-escalation ──────────────────────────────

-- Trigger function: blocks changes to the role column when the request
-- carries a regular authenticated JWT. Passes through for service_role
-- (no JWT claims) and direct DB/superuser sessions.

CREATE OR REPLACE FUNCTION public.guard_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  jwt_claims jsonb;
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    jwt_claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;

    -- Block if JWT is present and caller is not service_role
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


-- ── 5. payments: fix broken policy + scope doctor access ─────────

-- Drop the faulty policy from 20260328000001. It referenced doctor_id
-- which does not exist on the payments table — this policy would error
-- on application.
DROP POLICY IF EXISTS "payments: user can read own" ON public.payments;

-- Drop the overbroad "any doctor sees all payments" policy from rls.sql
DROP POLICY IF EXISTS "payments__doctor_select_all" ON public.payments;
DROP POLICY IF EXISTS "payments__doctor_select"     ON public.payments;

-- Doctor reads only payments linked to their own appointments.
-- payments.appointment_id → appointments.doctor_id is the only valid path.
-- Membership payments (appointment_id IS NULL) are excluded — those are
-- handled by getProMembers() which runs under service_role.
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


-- ── 6. announcements: sync patient policy with migration 010 ──────
--
-- Migration 20260320000010 added status + audience columns.
-- If those columns already exist we use the full audience-aware policy.
-- If they don't exist yet (migration 010 not yet applied) we fall back
-- to the simple published = true guard so this migration never errors.

DROP POLICY IF EXISTS "announcements__patient_select_published" ON public.announcements;
DROP POLICY IF EXISTS "announcements: patients read published"   ON public.announcements;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'announcements'
      AND column_name  = 'status'
  ) THEN
    -- Migration 010 has been applied — use full status + audience policy
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
    -- Migration 010 not yet applied — use simple published boolean guard
    EXECUTE $policy$
      CREATE POLICY "announcements__patient_select_published"
        ON public.announcements FOR SELECT
        USING (published = true AND public.is_patient())
    $policy$;
  END IF;
END;
$$;


-- ── Verification queries (uncomment to run) ───────────────────────

-- Confirm no overbroad "full_access" policies remain on these tables:
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('appointments','documents','vitals','payments')
-- ORDER BY tablename, cmd;

-- Confirm the role guard trigger exists:
-- SELECT tgname, tgtype FROM pg_trigger
-- WHERE tgrelid = 'public.users'::regclass
--   AND tgname = 'guard_role_escalation';
