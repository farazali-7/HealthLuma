-- ============================================================
-- HealthLuma — Booking Helpers
-- Run AFTER schema.sql (tables must already exist).
-- ============================================================


-- ── 1. get_booked_slots ──────────────────────────────────────
--
-- Returns only the start_time strings for booked slots on a given date.
-- SECURITY DEFINER so any authenticated patient can call it without
-- seeing other patients' appointment rows (RLS would otherwise block cross-patient reads).
-- The function leaks nothing except the booked time strings.
--
DROP FUNCTION IF EXISTS public.get_booked_slots(uuid, date);

CREATE OR REPLACE FUNCTION public.get_booked_slots(
  p_doctor_id uuid,
  p_date      date
)
RETURNS TABLE(start_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.start_time
  FROM   public.appointments a
  WHERE  a.doctor_id        = p_doctor_id
    AND  a.appointment_date = p_date
    AND  a.status IN ('upcoming', 'completed');
$$;

-- Grant execute to authenticated users so the browser client can call it.
GRANT EXECUTE ON FUNCTION public.get_booked_slots(uuid, date) TO authenticated;


-- ── 2. doctor_availability — ensure table exists ─────────────
--
-- If the user ran schema.sql this already exists; IF NOT EXISTS makes
-- this migration safe to re-run.
--
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week        smallint    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time         text        NOT NULL,  -- HH:MM  (24-hour)
  end_time           text        NOT NULL,  -- HH:MM  (24-hour)
  slot_duration_mins smallint    NOT NULL DEFAULT 30,
  is_active          boolean     NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, day_of_week)
);

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read availability (needed to render the booking calendar).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'doctor_availability'
      AND policyname = 'doctor_availability__authenticated_select'
  ) THEN
    CREATE POLICY "doctor_availability__authenticated_select"
      ON public.doctor_availability FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- ── 3. appointments — ensure table exists ────────────────────

CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  family_member_id uuid,
  appointment_date date        NOT NULL,
  start_time       text        NOT NULL,  -- HH:MM
  end_time         text        NOT NULL,  -- HH:MM
  type             text        NOT NULL
                               CHECK (type IN ('follow-up','consultation','checkup','prescription-review')),
  status           text        NOT NULL DEFAULT 'upcoming'
                               CHECK (status IN ('upcoming','completed','cancelled','no-show')),
  notes            text,
  location         text        NOT NULL DEFAULT '',
  is_priority      boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'appointments'
      AND policyname = 'appointments__patient_select_own'
  ) THEN
    CREATE POLICY "appointments__patient_select_own"
      ON public.appointments FOR SELECT
      USING (patient_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'appointments'
      AND policyname = 'appointments__patient_insert'
  ) THEN
    CREATE POLICY "appointments__patient_insert"
      ON public.appointments FOR INSERT
      WITH CHECK (patient_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'appointments'
      AND policyname = 'appointments__patient_cancel'
  ) THEN
    CREATE POLICY "appointments__patient_cancel"
      ON public.appointments FOR UPDATE
      USING  (patient_id = auth.uid() AND status = 'upcoming')
      WITH CHECK (patient_id = auth.uid() AND status = 'cancelled');
  END IF;
END $$;
