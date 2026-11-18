-- Core schema for the Banga dashboard (rebuilt baseline; replaces supabase/legacy-migrations).
-- Tables inferred from application code. RLS is enabled on every table.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- users (mirrors auth.users; role drives admin checks)
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text,
  surname text,
  phone text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = auth.uid()), false);
$$;

-- NOTE: every new signup becomes 'admin' (existing app behaviour, see app/register).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name', 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile or admins all" ON public.users
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id AND role = (SELECT u.role FROM public.users u WHERE u.id = (SELECT auth.uid())));

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  logo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- profiles (only used by registerUserWithCorporation)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  team_id uuid REFERENCES public.teams (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- events + pricing tiers + tickets
-- ---------------------------------------------------------------------------
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time NOT NULL,
  location text,
  team1_id uuid REFERENCES public.teams (id) ON DELETE SET NULL,
  team2_id uuid REFERENCES public.teams (id) ON DELETE SET NULL,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_date ON public.events (date);

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage events" ON public.events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  sold_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pricing_tiers_sold_lte_quantity CHECK (sold_quantity >= 0 AND sold_quantity <= quantity)
);
CREATE INDEX idx_pricing_tiers_event_id ON public.pricing_tiers (event_id);

CREATE TRIGGER update_pricing_tiers_updated_at
BEFORE UPDATE ON public.pricing_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pricing tiers" ON public.pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage pricing tiers" ON public.pricing_tiers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES public.pricing_tiers (id) ON DELETE RESTRICT,
  purchaser_name text NOT NULL,
  purchaser_surname text,
  purchaser_email text NOT NULL,
  is_validated boolean NOT NULL DEFAULT false,
  validated_at timestamptz,
  qr_code_url text,
  pdf_url text,
  status text NOT NULL DEFAULT 'valid',
  stripe_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tickets_event_id ON public.tickets (event_id);
CREATE INDEX idx_tickets_tier_id ON public.tickets (tier_id);
CREATE INDEX idx_tickets_purchaser_email ON public.tickets (purchaser_email);
CREATE INDEX idx_tickets_stripe_session_id ON public.tickets (stripe_session_id);

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage tickets" ON public.tickets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atomic event + tiers creation (called from POST /api/events with the user's session)
CREATE OR REPLACE FUNCTION public.create_event_with_tiers(event_data jsonb, tiers_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_event public.events;
BEGIN
  INSERT INTO public.events (title, description, date, time, location, team1_id, team2_id, cover_image_url)
  VALUES (
    event_data ->> 'title',
    event_data ->> 'description',
    (event_data ->> 'date')::date,
    (event_data ->> 'time')::time,
    event_data ->> 'location',
    NULLIF(event_data ->> 'team1_id', '')::uuid,
    NULLIF(event_data ->> 'team2_id', '')::uuid,
    event_data ->> 'cover_image_url'
  )
  RETURNING * INTO new_event;

  INSERT INTO public.pricing_tiers (event_id, name, description, price, quantity)
  SELECT new_event.id, t ->> 'name', t ->> 'description', (t ->> 'price')::numeric, (t ->> 'quantity')::integer
  FROM jsonb_array_elements(tiers_data) AS t;

  RETURN to_jsonb(new_event);
END;
$$;

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE public.subscription_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  features text[],
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_subscription_types_updated_at
BEFORE UPDATE ON public.subscription_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscription_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active subscription types" ON public.subscription_types
  FOR SELECT USING (is_active);
CREATE POLICY "Authenticated users can manage subscription types" ON public.subscription_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchaser_name text NOT NULL,
  purchaser_surname text,
  purchaser_email text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz NOT NULL,
  qr_code_url text,
  owner_id text,
  subscription_type_id uuid REFERENCES public.subscription_types (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  purchase_date timestamptz NOT NULL DEFAULT now(),
  stripe_session_id text UNIQUE,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_subscriptions_email ON public.user_subscriptions (purchaser_email);
CREATE INDEX idx_user_subscriptions_type ON public.user_subscriptions (subscription_type_id);

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage user subscriptions" ON public.user_subscriptions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Read by validate-qr / validate-subscription / verify routes (shape inferred from code; overlaps user_subscriptions)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchaser_name text,
  purchaser_surname text,
  purchaser_email text,
  valid_from timestamptz,
  valid_to timestamptz,
  qr_code_url text,
  stripe_subscription_id text,
  subscription_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- coupons, fans, subscribers
-- ---------------------------------------------------------------------------
CREATE TABLE public.coupon_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  min_order_amount numeric NOT NULL DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_coupon_codes_updated_at
BEFORE UPDATE ON public.coupon_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage coupons" ON public.coupon_codes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.fans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  surname text,
  phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.fans IS 'Customers (fans) who purchase tickets or subscriptions.';

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.fans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage fans" ON public.fans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage subscribers" ON public.subscribers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- club content: players, standings, posts
-- ---------------------------------------------------------------------------
CREATE TABLE public.banga_playerss (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  surname text,
  number text,
  position text,
  team_key text,
  matches integer NOT NULL DEFAULT 0,
  minutes integer NOT NULL DEFAULT 0,
  goals integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  yellow_cards integer NOT NULL DEFAULT 0,
  red_cards integer NOT NULL DEFAULT 0,
  image_url text,
  inserted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_banga_playerss_name_team ON public.banga_playerss (name, team_key);

CREATE TRIGGER update_banga_playerss_updated_at
BEFORE UPDATE ON public.banga_playerss
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.banga_playerss ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view players" ON public.banga_playerss FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage players" ON public.banga_playerss
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.standings_al (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL UNIQUE,
  team_key text,
  team_name text NOT NULL,
  position integer,
  played integer NOT NULL DEFAULT 0,
  won integer NOT NULL DEFAULT 0,
  drawn integer NOT NULL DEFAULT 0,
  lost integer NOT NULL DEFAULT 0,
  scored integer NOT NULL DEFAULT 0,
  conceded integer NOT NULL DEFAULT 0,
  goal_diff text,
  points integer NOT NULL DEFAULT 0,
  logo text
);
CREATE INDEX idx_standings_al_team_key ON public.standings_al (team_key, position);

ALTER TABLE public.standings_al ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view standings" ON public.standings_al FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage standings" ON public.standings_al
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  excerpt text,
  author text,
  published_date timestamptz,
  url text UNIQUE,
  image_url text,
  category text,
  tags text[],
  source text,
  fingerprint text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_published_date ON public.posts (published_date DESC);

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage posts" ON public.posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Storage buckets (all public-read; code uses getPublicUrl)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('covers', 'covers', true),
  ('team-logo', 'team-logo', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read covers and team logos" ON storage.objects
  FOR SELECT USING (bucket_id IN ('covers', 'team-logo'));
CREATE POLICY "Authenticated upload covers and team logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('covers', 'team-logo'));
CREATE POLICY "Authenticated update covers and team logos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id IN ('covers', 'team-logo'));
CREATE POLICY "Authenticated delete covers and team logos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id IN ('covers', 'team-logo'));
