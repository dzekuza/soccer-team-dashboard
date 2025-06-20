-- Drop duplicate indexes
DROP INDEX IF EXISTS idx_events_date;  -- Keep idx_events_date_nulls_last instead
DROP INDEX IF EXISTS idx_tickets_validated;  -- Keep idx_tickets_validated_nulls_last instead

-- Drop unused indexes (based on usage statistics)
DROP INDEX IF EXISTS idx_users_corporation_id;
DROP INDEX IF EXISTS idx_events_corporation_id;
DROP INDEX IF EXISTS idx_pricing_tiers_corporation_id;
DROP INDEX IF EXISTS idx_tickets_corporation_id;
DROP INDEX IF EXISTS idx_pricing_tiers_event_id;
DROP INDEX IF EXISTS idx_tickets_event_id;
DROP INDEX IF EXISTS idx_tickets_tier_id;
DROP INDEX IF EXISTS idx_users_email;

-- Optimized indexes for common queries
-- Events table indexes
CREATE INDEX idx_events_corp_created ON events (corporation_id, created_at DESC NULLS LAST);
CREATE INDEX idx_events_date_nulls_last ON events (date DESC NULLS LAST);
CREATE INDEX idx_events_corp_date ON events (corporation_id, date DESC NULLS LAST);

-- Pricing tiers indexes
CREATE INDEX idx_pricing_tiers_corp_event ON pricing_tiers (corporation_id, event_id);
CREATE INDEX idx_pricing_tiers_price ON pricing_tiers (price);
CREATE INDEX idx_pricing_tiers_availability ON pricing_tiers (max_quantity - sold_quantity);

-- Tickets indexes
CREATE INDEX idx_tickets_corp_created ON tickets (corporation_id, created_at DESC NULLS LAST);
CREATE INDEX idx_tickets_validated_nulls_last ON tickets (is_validated, validated_at DESC NULLS LAST);
CREATE INDEX idx_tickets_event_tier ON tickets (event_id, tier_id);
CREATE INDEX idx_tickets_purchaser ON tickets (purchaser_email, purchaser_name);

-- Users indexes
CREATE INDEX idx_users_corp_role ON users (corporation_id, role);
CREATE INDEX idx_users_email_unique ON users (email);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_corp_created ON subscriptions (corporation_id, created_at DESC NULLS LAST);
CREATE INDEX idx_subscriptions_price ON subscriptions (price);

-- User subscriptions indexes
CREATE INDEX idx_user_subs_corp_dates ON user_subscriptions (corporation_id, start_date, end_date);
CREATE INDEX idx_user_subs_user ON user_subscriptions (user_id);
CREATE INDEX idx_user_subs_subscription ON user_subscriptions (subscription_id);
CREATE INDEX idx_user_subs_dates ON user_subscriptions (start_date, end_date);

-- Add comments to document index purposes
COMMENT ON INDEX idx_events_corp_created IS 'Optimizes corporation-specific event listing with created_at sorting';
COMMENT ON INDEX idx_events_date_nulls_last IS 'Optimizes date-based event queries with proper NULL handling';
COMMENT ON INDEX idx_events_corp_date IS 'Optimizes corporation-specific event queries with date filtering';

COMMENT ON INDEX idx_pricing_tiers_corp_event IS 'Optimizes pricing tier lookups by corporation and event';
COMMENT ON INDEX idx_pricing_tiers_price IS 'Supports price-based analytics and filtering';
COMMENT ON INDEX idx_pricing_tiers_availability IS 'Optimizes queries for available ticket quantities';

COMMENT ON INDEX idx_tickets_corp_created IS 'Optimizes corporation-specific ticket listing with created_at sorting';
COMMENT ON INDEX idx_tickets_validated_nulls_last IS 'Optimizes validation status queries with proper NULL handling';
COMMENT ON INDEX idx_tickets_event_tier IS 'Optimizes ticket lookups by event and pricing tier';
COMMENT ON INDEX idx_tickets_purchaser IS 'Supports purchaser-based ticket lookups';

COMMENT ON INDEX idx_users_corp_role IS 'Optimizes user queries filtered by corporation and role';
COMMENT ON INDEX idx_users_email_unique IS 'Ensures email uniqueness and optimizes email-based lookups';

COMMENT ON INDEX idx_subscriptions_corp_created IS 'Optimizes corporation-specific subscription listing';
COMMENT ON INDEX idx_subscriptions_price IS 'Supports price-based subscription filtering';

COMMENT ON INDEX idx_user_subs_corp_dates IS 'Optimizes corporation-specific subscription queries with date filtering';
COMMENT ON INDEX idx_user_subs_user IS 'Optimizes user-specific subscription lookups';
COMMENT ON INDEX idx_user_subs_subscription IS 'Optimizes subscription-based user lookups';
COMMENT ON INDEX idx_user_subs_dates IS 'Optimizes date-range subscription queries'; 