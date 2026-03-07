-- Migration: Harden handle_new_user trigger
-- Always inserts role = 'patient' regardless of what the client sends.
-- Role promotion (patient → doctor) must be done manually via SQL by the admin.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'patient'   -- always patient; promote to doctor manually via SQL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
