-- ============================================================
-- HealthLuma — Patient Settings Fields
-- Adds medical profile, emergency contact, notification preferences
-- to public.users, and creates the avatars storage bucket.
-- ============================================================

-- ── 1. New columns on public.users ────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS blood_type                 text
    CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  ADD COLUMN IF NOT EXISTS gender                     text
    CHECK (gender IN ('Male','Female','Non-binary','Prefer not to say')),
  ADD COLUMN IF NOT EXISTS smoking_status             text
    CHECK (smoking_status IN ('Non-smoker','Former smoker','Current smoker')),
  ADD COLUMN IF NOT EXISTS allergies                  text,
  ADD COLUMN IF NOT EXISTS chronic_conditions         text,
  ADD COLUMN IF NOT EXISTS other_medications          text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name     text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relation text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone    text,
  -- Persists all notification preference toggles as a flat JSON object.
  -- Keys match the toggle IDs in the UI: e.g. "appt_reminder_24h", "channel_email".
  -- Default empty object — UI falls back to hardcoded defaults if key is missing.
  ADD COLUMN IF NOT EXISTS notification_preferences   jsonb NOT NULL DEFAULT '{}';


-- ── 2. Avatars storage bucket (public — served via CDN URL) ──

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,               -- Public: avatar URLs don't need signed tokens
  5242880,            -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ── 3. Storage RLS for avatars ────────────────────────────────
-- Path convention: {user_id}/{filename}

-- Users upload their own avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND policyname = 'avatars: authenticated upload own'
  ) THEN
    CREATE POLICY "avatars: authenticated upload own"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND policyname = 'avatars: public read'
  ) THEN
    CREATE POLICY "avatars: public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND policyname = 'avatars: authenticated delete own'
  ) THEN
    CREATE POLICY "avatars: authenticated delete own"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;


-- ── Verification ─────────────────────────────────────────────
-- Run this to confirm the new columns exist:
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'users'
-- ORDER BY ordinal_position;
