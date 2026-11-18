-- Add events column to fixtures table
ALTER TABLE public.fixtures_all_new
ADD COLUMN IF NOT EXISTS events JSONB;
