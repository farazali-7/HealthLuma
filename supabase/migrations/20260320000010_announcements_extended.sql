-- ============================================================
-- HealthLuma — Announcements: status, audience, scheduling
-- Extends the announcements table with production-required fields.
-- ============================================================

-- ── 1. Add new columns ──────────────────────────────────────

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS status       text        NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'draft', 'scheduled')),
  ADD COLUMN IF NOT EXISTS audience     text        NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'pro', 'specific')),
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS reads_count  integer     NOT NULL DEFAULT 0;

-- ── 2. Sync existing rows ────────────────────────────────────
-- Rows that had published=false become 'draft'; published=true stay 'published'.

UPDATE public.announcements
  SET status = CASE WHEN published THEN 'published' ELSE 'draft' END
  WHERE true;

-- ── 3. Indexes ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_announcements_doctor ON public.announcements(doctor_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);

-- ── 4. Update patient RLS policy ────────────────────────────
-- Replace the simple published=true check with status-aware + audience-aware rule.

DROP POLICY IF EXISTS "announcements: patients read published" ON public.announcements;

CREATE POLICY "announcements: patients read published"
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
  );
