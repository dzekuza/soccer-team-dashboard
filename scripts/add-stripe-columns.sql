-- Add Stripe-specific columns to the existing subscriptions table
-- This migration adds the columns needed for Stripe integration

-- Add stripe_subscription_id column
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;

-- Add subscription_status column
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Add index for stripe_subscription_id for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id 
ON subscriptions(stripe_subscription_id);

-- Add index for subscription_status for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON subscriptions(subscription_status);

-- Add comments to document the new columns
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID for payment tracking';
COMMENT ON COLUMN subscriptions.subscription_status IS 'Subscription status (active, cancelled, past_due, etc.)';

-- Update existing records to have a default status
UPDATE subscriptions 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL;

-- Display the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;