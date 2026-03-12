-- ============================================================
-- HealthLuma — Doctor RLS Policies + Prescriptions Table
-- ============================================================


-- ── 1. SECURITY DEFINER helper — returns the current user's role ─
--
-- Called inside RLS policies on public.users to avoid the infinite
-- recursion that occurs when a policy subqueries the same table.
-- SECURITY DEFINER bypasses RLS on its internal SELECT.
--
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;


-- ── 2. Allow doctors to read patient profiles ────────────────────
--
-- Required for: appointment list (patient name join),
--               prescription list (patient name join).
-- Safe: auth_user_role() is SECURITY DEFINER — no recursion.
--
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'users'
      AND policyname = 'users__doctor_reads_patients'
  ) THEN
    CREATE POLICY "users__doctor_reads_patients"
      ON public.users FOR SELECT
      USING (public.auth_user_role() = 'doctor');
  END IF;
END $$;


-- ── 3. Doctor policies on appointments ───────────────────────────
--
-- Doctors need to SELECT and UPDATE their own appointments.
-- Patient INSERT/SELECT/UPDATE policies already exist from migration 3.
--
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'appointments'
      AND policyname = 'appointments__doctor_select'
  ) THEN
    CREATE POLICY "appointments__doctor_select"
      ON public.appointments FOR SELECT
      USING (doctor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'appointments'
      AND policyname = 'appointments__doctor_update'
  ) THEN
    CREATE POLICY "appointments__doctor_update"
      ON public.appointments FOR UPDATE
      USING  (doctor_id = auth.uid())
      WITH CHECK (doctor_id = auth.uid());
  END IF;
END $$;


-- ── 4. Prescriptions table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id uuid        REFERENCES public.appointments(id) ON DELETE SET NULL,
  medication     text        NOT NULL,
  dose           text        NOT NULL,
  frequency      text        NOT NULL,
  duration       text,
  condition      text,
  notes          text,
  refills_total  smallint    NOT NULL DEFAULT 0,
  refills_used   smallint    NOT NULL DEFAULT 0,
  status         text        NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active','completed','refill-due','discontinued')),
  prescribed_at  date        NOT NULL DEFAULT CURRENT_DATE,
  expires_at     date,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_prescription_updated()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_prescription_updated'
  ) THEN
    CREATE TRIGGER on_prescription_updated
      BEFORE UPDATE ON public.prescriptions
      FOR EACH ROW EXECUTE FUNCTION public.handle_prescription_updated();
  END IF;
END $$;

-- RLS policies for prescriptions
DO $$
BEGIN
  -- Patient reads own prescriptions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'prescriptions'
      AND policyname = 'prescriptions__patient_select'
  ) THEN
    CREATE POLICY "prescriptions__patient_select"
      ON public.prescriptions FOR SELECT
      USING (patient_id = auth.uid());
  END IF;

  -- Doctor reads prescriptions they issued
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'prescriptions'
      AND policyname = 'prescriptions__doctor_select'
  ) THEN
    CREATE POLICY "prescriptions__doctor_select"
      ON public.prescriptions FOR SELECT
      USING (doctor_id = auth.uid());
  END IF;

  -- Doctor issues new prescriptions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'prescriptions'
      AND policyname = 'prescriptions__doctor_insert'
  ) THEN
    CREATE POLICY "prescriptions__doctor_insert"
      ON public.prescriptions FOR INSERT
      WITH CHECK (doctor_id = auth.uid());
  END IF;

  -- Doctor updates their prescriptions (e.g. mark refill used, change status)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'prescriptions'
      AND policyname = 'prescriptions__doctor_update'
  ) THEN
    CREATE POLICY "prescriptions__doctor_update"
      ON public.prescriptions FOR UPDATE
      USING  (doctor_id = auth.uid())
      WITH CHECK (doctor_id = auth.uid());
  END IF;
END $$;
