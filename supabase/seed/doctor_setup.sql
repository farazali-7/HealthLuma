-- ============================================================
-- HealthLuma — Doctor Setup Seed
-- Run ONCE after you have created Dr. Emily's account via Supabase Auth.
--
-- Steps:
--   1. Sign up at /signup with any email (e.g. dr.emily@healthluma.com).
--      The trigger creates a public.users row with role='patient'.
--   2. Paste this file into the Supabase SQL Editor and run it.
--      Replace 'dr.emily@healthluma.com' with the actual email you used.
-- ============================================================


-- ── Step 1: Promote to doctor + set display name ─────────────
UPDATE public.users
SET
  role      = 'doctor',
  full_name = 'Dr. Emily Carter'
WHERE email = 'dr.emily@healthluma.com';   -- ← change to actual email


-- ── Step 2: Add weekly availability ──────────────────────────
--
-- Monday–Saturday  |  9:00 AM – 5:00 PM  |  30-minute slots
-- Sunday is closed (no row inserted).
--
INSERT INTO public.doctor_availability
  (doctor_id, day_of_week, start_time, end_time, slot_duration_mins, is_active)
SELECT
  u.id,
  day_num,
  '09:00',
  '17:00',
  30,
  true
FROM public.users u,
     unnest(ARRAY[1, 2, 3, 4, 5, 6]) AS day_num   -- Mon=1 … Sat=6
WHERE u.email = 'dr.emily@healthluma.com'           -- ← same email as above
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;


-- ── Verify ───────────────────────────────────────────────────
-- Run this SELECT to confirm the setup looks correct:
--
-- SELECT u.email, u.role, u.full_name,
--        da.day_of_week, da.start_time, da.end_time, da.slot_duration_mins
-- FROM public.users u
-- JOIN public.doctor_availability da ON da.doctor_id = u.id
-- WHERE u.role = 'doctor'
-- ORDER BY da.day_of_week;
