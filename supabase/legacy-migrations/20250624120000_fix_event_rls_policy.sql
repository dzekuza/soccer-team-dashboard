-- Drop the overly broad "manage" policy for events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

-- Recreate it to only cover write operations (INSERT, UPDATE, DELETE),
-- leaving SELECT to be handled by the "Anyone can view events" policy.
CREATE POLICY "Admins can manage events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can manage events for update"
  ON public.events FOR UPDATE TO authenticated
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );
  
CREATE POLICY "Admins can manage events for delete"
  ON public.events FOR DELETE TO authenticated
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' ); 