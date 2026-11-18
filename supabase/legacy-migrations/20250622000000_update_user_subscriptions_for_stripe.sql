-- Update user_subscriptions table to support Stripe integration
-- Add missing columns for Stripe subscription tracking

-- Add new columns to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for stripe_subscription_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id 
ON user_subscriptions(stripe_subscription_id);

-- Create index for customer_email for email-based lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_email 
ON user_subscriptions(customer_email);

-- Create index for status for status-based queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status 
ON user_subscriptions(status);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dates 
ON user_subscriptions(start_date, end_date);

-- Add comments to document the new columns
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