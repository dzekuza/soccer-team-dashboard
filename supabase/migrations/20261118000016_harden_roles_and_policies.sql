-- Security hardening (replaces the "everyone is admin / any authenticated user can write" setup).
--
-- Roles: 'admin' manages content, shop, coupons, fans etc.; 'staff' can read tickets and
-- subscriptions and validate tickets (scanner) but cannot change content.
-- The FIRST user to sign up becomes admin (bootstrap); everyone after is 'staff' and must be
-- promoted by an existing admin / the service role:
--   update public.users set role = 'admin' where email = '...';
-- Also disable open signups in Supabase Auth (or restrict to invited emails) for a staff-only app.

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
    CASE WHEN EXISTS (SELECT 1 FROM public.users WHERE role = 'admin') THEN 'staff' ELSE 'admin' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role IN ('admin', 'staff') FROM public.users WHERE id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- Admin-only writes (public SELECT policies stay where they exist)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can manage pricing tiers" ON public.pricing_tiers;
CREATE POLICY "Admins can manage pricing tiers" ON public.pricing_tiers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can manage subscription types" ON public.subscription_types;
CREATE POLICY "Admins can manage subscription types" ON public.subscription_types
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can manage players" ON public.banga_playerss;
CREATE POLICY "Admins can manage players" ON public.banga_playerss
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can manage standings" ON public.standings_al;
CREATE POLICY "Admins can manage standings_al" ON public.standings_al
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can insert/update" ON public.standings;
CREATE POLICY "Admins can manage standings" ON public.standings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.posts;
CREATE POLICY "Admins can manage posts" ON public.posts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin insert access" ON public.banga_posts;
DROP POLICY IF EXISTS "Admin update access" ON public.banga_posts;
DROP POLICY IF EXISTS "Admin delete access" ON public.banga_posts;
CREATE POLICY "Admins can manage banga posts" ON public.banga_posts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Personal data (tickets, subscriptions): admins everything, staff read (+ validate tickets)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage tickets" ON public.tickets;
CREATE POLICY "Admins can manage tickets" ON public.tickets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Staff can view tickets" ON public.tickets
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "Staff can validate tickets" ON public.tickets
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can manage user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage user subscriptions" ON public.user_subscriptions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Staff can view user subscriptions" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Staff can view subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage: public read stays; writes are admin-only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated upload covers and team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update covers and team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete covers and team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

CREATE POLICY "Admins upload public images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('covers', 'team-logo', 'product-images') AND public.is_admin());
CREATE POLICY "Admins update public images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('covers', 'team-logo', 'product-images') AND public.is_admin());
CREATE POLICY "Admins delete public images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('covers', 'team-logo', 'product-images') AND public.is_admin());
