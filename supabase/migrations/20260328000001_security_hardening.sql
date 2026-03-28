-- ============================================================
-- HealthLuma — Security Hardening Migration
-- Date: 2026-03-28
-- Applies:
--   • Private storage buckets (documents + avatars)
--   • Storage RLS policies scoped to owner's path
--   • Payments table RLS (doctor & patient see only own rows)
--
-- ⚠️  NOTE: Do NOT run the following command — it will fail because
--   Supabase owns the storage.objects table and RLS is already
--   enabled on it by default:
--
--     ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;  ← SKIP THIS
--
-- Run this file in the Supabase SQL Editor or via `supabase db push`.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- STEP 1 — Make storage buckets private
-- ────────────────────────────────────────────────────────────

UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

UPDATE storage.buckets
SET public = false
WHERE id = 'avatars';


-- ────────────────────────────────────────────────────────────
-- STEP 2 — Storage RLS: documents bucket
-- Patients can only access files whose top-level folder
-- matches their own auth.uid() (e.g. "user-uuid/filename.pdf")
-- ────────────────────────────────────────────────────────────

-- Drop if re-running this migration
DROP POLICY IF EXISTS "documents: patient owns path" ON storage.objects;

CREATE POLICY "documents: patient owns path"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ────────────────────────────────────────────────────────────
-- STEP 3 — Storage RLS: avatars bucket
-- Users can only access their own avatar files.
-- ────────────────────────────────────────────────────────────

-- Drop if re-running this migration
DROP POLICY IF EXISTS "avatars: user owns path" ON storage.objects;

CREATE POLICY "avatars: user owns path"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ────────────────────────────────────────────────────────────
-- STEP 4 — Enable RLS on payments table
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- STEP 5 — Payments RLS: users see only their own rows
-- Doctors see payments where they are the doctor.
-- Patients see payments where they are the patient.
-- ────────────────────────────────────────────────────────────

-- Drop if re-running this migration
DROP POLICY IF EXISTS "payments: user can read own" ON public.payments;

CREATE POLICY "payments: user can read own"
ON public.payments
FOR SELECT
TO authenticated
USING (
  doctor_id = auth.uid()
  OR patient_id = auth.uid()
);
