-- Create subscription_types table (this will be our main subscription types table)
CREATE TABLE IF NOT EXISTS subscription_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL,
  features text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT subscription_types_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Create user_subscriptions table for individual user subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  subscription_type_id uuid NOT NULL,
  purchaser_name text,
  purchaser_surname text,
  purchaser_email text,
  valid_from timestamp with time zone NOT NULL,
  valid_to timestamp with time zone NOT NULL,
  qr_code_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  purchase_date timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  owner_id text,
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_subscription_type_id_fkey FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_subscriptions_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id)
);

-- Add RLS policies for subscription_types
ALTER TABLE subscription_types ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read active subscription types
CREATE POLICY "Users can view active subscription types" ON subscription_types
  FOR SELECT USING (is_active = true);

-- Policy to allow all authenticated users to manage subscription types
CREATE POLICY "Authenticated users can manage subscription types" ON subscription_types
  FOR ALL USING (auth.role() = 'authenticated');

-- Add RLS policies for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Policy to allow all authenticated users to manage subscriptions
CREATE POLICY "Authenticated users can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default subscription types
INSERT INTO subscription_types (title, description, price, duration_days, features, is_active) VALUES
  ('Basic Monthly', 'Access to all home games for one month', 29.99, 30, ARRAY['All home games', 'Email support', 'Mobile tickets'], true),
  ('Premium Monthly', 'Access to all games with premium benefits', 49.99, 30, ARRAY['All home and away games', 'Priority seating', 'VIP support', 'Exclusive content'], true),
  ('Season Pass', 'Full season access with all premium features', 299.99, 365, ARRAY['All games', 'Priority seating', 'VIP support', 'Exclusive content', 'Season merchandise'], true),
  ('VIP Annual', 'Premium annual subscription with exclusive benefits', 599.99, 365, ARRAY['All games', 'VIP seating', 'Exclusive events', 'Meet & greet opportunities', 'Premium merchandise'], true);

-- Create indexes for better performance
CREATE INDEX idx_subscription_types_is_active ON subscription_types(is_active);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_subscription_type_id ON user_subscriptions(subscription_type_id);
CREATE INDEX idx_user_subscriptions_valid_to ON user_subscriptions(valid_to);
