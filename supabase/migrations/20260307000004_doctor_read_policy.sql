-- ============================================================
-- HealthLuma — Doctor Read Policy + Availability Seed
-- ============================================================

-- ── 1. Allow authenticated patients to read doctor profiles ──
--
-- Required for:
--   • Booking modal (fetches first doctor by role)
--   • Appointments list (joins users for doctor name)
--
-- Safe: USING (role = 'doctor') checks the current row's column value
-- only — it does NOT subquery public.users, so no infinite recursion.
--
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'users'
      AND policyname = 'users__read_doctor_profiles'
  ) THEN
    CREATE POLICY "users__read_doctor_profiles"
      ON public.users FOR SELECT
      USING (role = 'doctor');
  END IF;
END $$;


-- ── 2. Seed default weekly availability for all existing doctors ─
--
-- Mon–Sat (day_of_week 1–6), 09:00–17:00, 30-minute slots.
-- Sunday (0) is intentionally excluded (closed).
-- ON CONFLICT DO NOTHING makes this safe to re-run.
--
-- First ensure the unique constraint exists so future ON CONFLICT works correctly.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.doctor_availability'::regclass
      AND conname  = 'doctor_availability_doctor_id_day_of_week_key'
  ) THEN
    ALTER TABLE public.doctor_availability
      ADD CONSTRAINT doctor_availability_doctor_id_day_of_week_key
      UNIQUE (doctor_id, day_of_week);
  END IF;
END $$;

INSERT INTO public.doctor_availability
  (doctor_id, day_of_week, start_time, end_time, slot_duration_mins, is_active)
SELECT
  u.id,
  d.day_num,
  '09:00',
  '17:00',
  30,
  true
FROM public.users u
CROSS JOIN (
  VALUES (1),(2),(3),(4),(5),(6)
) AS d(day_num)
WHERE u.role = 'doctor'
  AND NOT EXISTS (
    SELECT 1 FROM public.doctor_availability da
    WHERE da.doctor_id   = u.id
      AND da.day_of_week = d.day_num
  );



