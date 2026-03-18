-- ============================================================
-- HealthLuma — Notifications Table
-- Safe to re-run: uses IF NOT EXISTS throughout.
-- Run AFTER schema.sql / rls.sql have been applied.
-- ============================================================


-- ── 1. Table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN (
               'appointment_reminder',
               'appointment_confirmed',
               'appointment_cancelled',
               'prescription_refill',
               'new_prescription',
               'new_document',
               'pro_renewal',
               'new_announcement'
             )),
  title      text        NOT NULL,
  body       text        NOT NULL,
  link       text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON public.notifications(user_id);

-- Partial index — fast unread queries (WHERE read_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;


-- ── 2. RLS ───────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users read their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'notifications'
      AND policyname = 'notifications__own_select'
  ) THEN
    CREATE POLICY "notifications__own_select"
      ON public.notifications FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Users mark their own notifications as read (update read_at)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'notifications'
      AND policyname = 'notifications__own_update'
  ) THEN
    CREATE POLICY "notifications__own_update"
      ON public.notifications FOR UPDATE
      USING    (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Users can delete their own notifications (dismiss)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'notifications'
      AND policyname = 'notifications__own_delete'
  ) THEN
    CREATE POLICY "notifications__own_delete"
      ON public.notifications FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- NOTE: No INSERT policy for regular users.
-- All inserts come from server actions using the service_role key,
-- which bypasses RLS. This ensures patients cannot forge notifications
-- for other users (e.g., a doctor's user_id).
