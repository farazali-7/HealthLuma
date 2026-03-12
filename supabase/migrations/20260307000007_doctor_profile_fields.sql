-- ============================================================
-- HealthLuma — Doctor Profile & Clinic Fields
-- Adds professional profile, clinic info, and appointment-
-- scheduling preferences to public.users for doctor accounts.
-- ============================================================

-- ── 1. Professional profile ────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS specialty       text,
  ADD COLUMN IF NOT EXISTS qualifications  text,
  ADD COLUMN IF NOT EXISTS license_number  text,
  ADD COLUMN IF NOT EXISTS bio             text;


-- ── 2. Clinic information ──────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clinic_name     text,
  ADD COLUMN IF NOT EXISTS clinic_phone    text,
  ADD COLUMN IF NOT EXISTS clinic_address  text,
  ADD COLUMN IF NOT EXISTS clinic_city     text,
  ADD COLUMN IF NOT EXISTS clinic_postcode text,
  ADD COLUMN IF NOT EXISTS clinic_website  text;


-- ── 3. Appointment scheduling preferences ─────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS default_slot_mins  smallint NOT NULL DEFAULT 30
    CHECK (default_slot_mins IN (15, 20, 30, 45, 60)),
  ADD COLUMN IF NOT EXISTS buffer_mins        smallint NOT NULL DEFAULT 5
    CHECK (buffer_mins IN (0, 5, 10, 15)),
  ADD COLUMN IF NOT EXISTS same_day_open_time text     NOT NULL DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS max_advance_weeks  smallint NOT NULL DEFAULT 4
    CHECK (max_advance_weeks IN (2, 4, 8, 12));


-- ── 4. RLS — doctors can update their own extended profile ─────
--
-- The existing "users: own row" update policy already covers
-- auth.uid() = id, so no new policy is needed.
-- The doctor_reads_patients SELECT policy allows doctors to read
-- ALL users rows; the write policies remain own-row-only.


-- ── Verification ──────────────────────────────────────────────
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'users'
--   AND column_name IN (
--     'specialty','qualifications','license_number','bio',
--     'clinic_name','clinic_phone','clinic_address','clinic_city',
--     'clinic_postcode','clinic_website',
--     'default_slot_mins','buffer_mins','same_day_open_time','max_advance_weeks'
--   )
-- ORDER BY ordinal_position;
