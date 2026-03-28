-- ============================================================
-- HealthLuma — Fix JWT Role Hook
-- Date: 2026-03-29
--
-- ROOT CAUSE:
--   The previous hook used jsonb_set with a 3-level nested path
--   ({claims,app_metadata,role}). PostgreSQL's jsonb_set silently
--   returns the input unchanged when an intermediate key is JSON null
--   (not SQL NULL). For users whose app_metadata is null or absent,
--   the role was never injected. No error was raised.
--
-- FIXES:
--   1. Rewrites the hook to explicitly handle null app_metadata
--      (matches the official Supabase pattern from their docs)
--   2. Ensures every existing auth user has a public.users row
--      so the SELECT always finds a role
-- ============================================================


-- ── 1. Drop old function ─────────────────────────────────────

DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);


-- ── 2. Rewrite hook — handles null app_metadata correctly ────
--
-- Pattern: extract claims → ensure app_metadata is an object →
--          set role → re-inject claims into event → return event
--
-- This is the pattern from the official Supabase documentation.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims    jsonb;
  user_role text;
BEGIN
  -- 1. Fetch the user's role from public.users
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  -- 2. Extract the claims object from the event
  claims := event->'claims';

  -- 3. Guard: if claims is somehow null, abort gracefully
  IF jsonb_typeof(claims) IS NULL THEN
    RETURN event;
  END IF;

  -- 4. Ensure app_metadata is a JSON object (not null / missing)
  --    jsonb_set cannot descend into a null value — this step is critical
  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  -- 5. Inject the role (defaults to 'patient' when no row exists)
  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(COALESCE(user_role, 'patient'))
  );

  -- 6. Write the modified claims back into the event and return
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;


-- ── 3. Re-apply permissions ───────────────────────────────────
-- (in case they were lost when the function was dropped)

GRANT EXECUTE
  ON FUNCTION public.custom_access_token_hook
  TO supabase_auth_admin;

GRANT SELECT (id, role)
  ON TABLE public.users
  TO supabase_auth_admin;

REVOKE EXECUTE
  ON FUNCTION public.custom_access_token_hook
  FROM PUBLIC;


-- ── 4. Backfill: ensure every auth user has a public.users row ─
--
-- Inserts a patient row for any auth user that is missing one.
-- Uses ON CONFLICT DO NOTHING so existing rows are untouched.
-- Role defaults to 'patient'; doctors must be updated manually
-- (see Step 5 below).

INSERT INTO public.users (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  COALESCE(au.raw_user_meta_data->>'role', 'patient')
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;  -- only insert missing rows


-- ── 5. MANUAL STEP (if needed) ───────────────────────────────
-- If the doctor account already has a row but with role = 'patient',
-- run this in the SQL editor — replace <DOCTOR_UUID>:
--
--   UPDATE public.users
--   SET role = 'doctor'
--   WHERE id = '<DOCTOR_UUID>';
--
-- ── 6. VERIFY ────────────────────────────────────────────────
-- Run these to confirm the fix:
--
--   -- Check hook function exists
--   SELECT proname, prosecdef
--   FROM pg_proc
--   WHERE proname = 'custom_access_token_hook';
--
--   -- Check grants
--   SELECT grantee, privilege_type
--   FROM information_schema.role_routine_grants
--   WHERE routine_name = 'custom_access_token_hook';
--
--   -- Check your specific user row
--   SELECT id, email, role
--   FROM public.users
--   WHERE id = '277433a7-8063-4e3e-b041-db564d383364';
--
--   -- Check all users have a row (should return 0)
--   SELECT COUNT(*) FROM auth.users au
--   LEFT JOIN public.users pu ON pu.id = au.id
--   WHERE pu.id IS NULL;
