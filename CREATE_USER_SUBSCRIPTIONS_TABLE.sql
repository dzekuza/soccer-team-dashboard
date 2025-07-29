-- Create user_subscriptions table for Stripe integration
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  customer_email TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id 
ON user_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_email 
ON user_subscriptions(customer_email);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
ON user_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dates 
ON user_subscriptions(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
ON user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id 
ON user_subscriptions(subscription_id);

-- Add comments to document the columns
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for payment tracking';
COMMENT ON COLUMN user_subscriptions.start_date IS 'Subscription start date from Stripe';
COMMENT ON COLUMN user_subscriptions.end_date IS 'Subscription end date from Stripe';
COMMENT ON COLUMN user_subscriptions.status IS 'Subscription status (active, cancelled, past_due, etc.)';
COMMENT ON COLUMN user_subscriptions.customer_email IS 'Customer email from Stripe checkout';
COMMENT ON COLUMN user_subscriptions.updated_at IS 'Last update timestamp';

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_subscriptions table
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at_trigger ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at_trigger
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Add RLS policies for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own subscriptions
CREATE POLICY "Select own user_subscriptions" ON user_subscriptions 
FOR SELECT USING (user_id = auth.uid());

-- Policy for users to insert their own subscriptions
CREATE POLICY "Insert own user_subscriptions" ON user_subscriptions 
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Verify the table was created
SELECT 'user_subscriptions table created successfully!' as status;