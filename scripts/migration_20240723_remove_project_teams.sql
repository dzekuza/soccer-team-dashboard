-- Add columns required by the application for ticket validation
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- Remove multi-tenancy columns from all relevant tables
ALTER TABLE public.tickets
DROP COLUMN IF EXISTS project_team_id;

ALTER TABLE public.events
DROP COLUMN IF EXISTS project_team_id;

ALTER TABLE public.pricing_tiers
DROP COLUMN IF EXISTS project_team_id; 