-- ============================================================
-- HealthLuma — JWT Role Hook
-- Date: 2026-03-28
--
-- Injects the user's role into every JWT as app_metadata.role
-- so that middleware can read it without a database query.
--
-- SETUP (one-time, after running this SQL):
--   1. Supabase Dashboard → Authentication → Hooks
--   2. Add hook: "Customize Access Token (JWT)"
--   3. Select function: public.custom_access_token_hook
--   4. Save — all new tokens will include app_metadata.role
--
-- IMPORTANT: Existing sessions will pick up the role on next
-- token refresh (within ~1 hour). Force it immediately by
-- signing users out and back in, or calling
-- supabase.auth.refreshSession() client-side.
-- ============================================================


-- ── 1. JWT hook function ─────────────────────────────────────
-- Called by Supabase Auth on every token generation/refresh.
-- Reads the user's role from public.users and injects it into
-- app_metadata so the claim travels inside the JWT.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  -- Inject role into app_metadata; default to 'patient' if row missing
  RETURN jsonb_set(
    event,
    '{claims,app_metadata,role}',
    to_jsonb(COALESCE(user_role, 'patient'))
  );
END;
$$;


-- ── 2. Permissions ───────────────────────────────────────────
-- supabase_auth_admin is the internal role that Supabase Auth
-- uses to invoke hooks. It needs EXECUTE on the function and
-- SELECT on the users table.

GRANT EXECUTE
  ON FUNCTION public.custom_access_token_hook
  TO supabase_auth_admin;

GRANT SELECT (id, role)
  ON TABLE public.users
  TO supabase_auth_admin;

-- Revoke from public for safety
REVOKE EXECUTE
  ON FUNCTION public.custom_access_token_hook
  FROM PUBLIC;
