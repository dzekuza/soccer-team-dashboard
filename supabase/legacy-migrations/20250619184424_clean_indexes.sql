-- Drop duplicate indexes
DROP INDEX IF EXISTS public.events_team1_id_idx;
DROP INDEX IF EXISTS idx_events_corporation_id;
DROP INDEX IF EXISTS idx_tickets_event_id;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets USING btree (created_at DESC);

-- Add index for pricing tiers price for sorting
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_price ON public.pricing_tiers USING btree (price);

-- Add index for events title search
CREATE INDEX IF NOT EXISTS idx_events_title_gin ON public.events USING gin (to_tsvector('english', title)); 