-- Follow-up to 20261118000016 (security review):
-- 1. Self-signups no longer get any privileges: new users are 'pending' until an admin
--    promotes them (the very first user still bootstraps as admin).
--      update public.users set role = 'staff' where email = '...';
-- 2. Staff may update tickets (scanner validates with the user's session) but only the
--    validation fields — enforced by a trigger, since RLS cannot restrict columns.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'pending'));
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'name',
    CASE WHEN EXISTS (SELECT 1 FROM public.users WHERE role = 'admin') THEN 'pending' ELSE 'admin' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.restrict_staff_ticket_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Service role / direct DB access (no auth.uid()) and admins are unrestricted.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - 'is_validated' - 'validated_at' - 'status' - 'updated_at')
     IS DISTINCT FROM
     (to_jsonb(OLD) - 'is_validated' - 'validated_at' - 'status' - 'updated_at') THEN
    RAISE EXCEPTION 'Staff may only update ticket validation fields';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER restrict_staff_ticket_updates
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.restrict_staff_ticket_updates();
