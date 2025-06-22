-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS corporations CASCADE;

-- Create corporations table
CREATE TABLE corporations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  owner_id uuid,
  CONSTRAINT corporations_pkey PRIMARY KEY (id),
  CONSTRAINT corporations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);

-- Create users table
CREATE TABLE users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  surname text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  corporation_id uuid,
  role character varying DEFAULT 'staff'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'staff'::character varying]::text[])),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_corporation_id_fkey FOREIGN KEY (corporation_id) REFERENCES corporations(id)
);

-- Create teams table
CREATE TABLE teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  logo text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);

-- Create events table
CREATE TABLE events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time time without time zone NOT NULL,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  team1_id uuid,
  team2_id uuid,
  cover_image_url text,
  corporation_id uuid,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES teams(id),
  CONSTRAINT events_corporation_id_fkey FOREIGN KEY (corporation_id) REFERENCES corporations(id),
  CONSTRAINT events_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES teams(id)
);

-- Create pricing_tiers table
CREATE TABLE pricing_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  max_quantity integer NOT NULL,
  sold_quantity integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  corporation_id uuid,
  CONSTRAINT pricing_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT pricing_tiers_corporation_id_fkey FOREIGN KEY (corporation_id) REFERENCES corporations(id),
  CONSTRAINT pricing_tiers_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  corporation_id uuid,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_corporation_id_fkey FOREIGN KEY (corporation_id) REFERENCES corporations(id)
);

-- Create tickets table
CREATE TABLE tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  tier_id uuid NOT NULL,
  purchaser_name text NOT NULL,
  purchaser_email text NOT NULL,
  is_validated boolean NOT NULL DEFAULT false,
  validated_at timestamp with time zone,
  qr_code_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  team1_id uuid,
  team2_id uuid,
  pdf_url text,
  corporation_id uuid,
  created_by uuid,
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES pricing_tiers(id),
  CONSTRAINT tickets_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES teams(id),
  CONSTRAINT tickets_corporation_id_fkey FOREIGN KEY (corporation_id) REFERENCES corporations(id),
  CONSTRAINT tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT tickets_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES teams(id)
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  subscription_id uuid NOT NULL,
  purchase_date timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  assigned_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  corporation_id uuid,
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
  CONSTRAINT user_subscriptions_corporation_id_fkey FOREIGN KEY (corporation_id) REFERENCES corporations(id)
); 