-- Create a helper function to check for admin role.
-- This is more secure and efficient than using subqueries in RLS policies.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.users
    WHERE id = auth.uid()
  ) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

--
-- Policies for: public.users
--
-- Drop the old policy that used a subquery.
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;

-- Create a new, more efficient policy using the helper function.
CREATE POLICY "Admins can view all user profiles"
  ON public.users FOR SELECT
  USING (is_admin());

--
-- Policies for: public.tickets
--
-- Drop the old policy that used a subquery.
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;

-- Create a new, more efficient policy using the helper function.
CREATE POLICY "Admins can manage all tickets"
  ON public.tickets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
