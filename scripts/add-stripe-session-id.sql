-- Add stripe_session_id column to tickets table for tracking Stripe checkout sessions
-- This allows us to fetch tickets by session ID on the success page

-- Add stripe_session_id column
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add index for stripe_session_id for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_stripe_session_id 
ON tickets(stripe_session_id);

-- Add comment to document the new column
COMMENT ON COLUMN tickets.stripe_session_id IS 'Stripe checkout session ID for payment tracking';

-- Display the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;