-- ============================================================
-- HealthLuma — Supabase Storage Configuration
-- Paste into Supabase SQL Editor AFTER running schema.sql
-- ============================================================

-- Creates the "documents" storage bucket and its access policies.
-- Patients can upload/download their own files.
-- Doctors can upload/download files for any patient.

-- ── Create bucket ────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,                          -- Private bucket. Use signed URLs to serve files.
  20971520,                       -- 20 MB limit per file
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- ── Storage RLS Policies ─────────────────────────────────────

-- File path convention:  {patient_user_id}/{filename}
-- This allows us to scope access by extracting the first path segment.

-- Patient: upload files to their own folder
CREATE POLICY "documents: patient upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Patient: read/download their own files
CREATE POLICY "documents: patient read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Patient: delete their own files
CREATE POLICY "documents: patient delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Doctor: full access to all documents (any patient folder)
CREATE POLICY "documents: doctor full access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'doctor'
    )
  );
