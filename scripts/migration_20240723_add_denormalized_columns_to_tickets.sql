-- Add missing denormalized event columns to the tickets table
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS team1_id UUID REFERENCES public.teams(id),
ADD COLUMN IF NOT EXISTS team2_id UUID REFERENCES public.teams(id),
ADD COLUMN IF NOT EXISTS event_title TEXT,
ADD COLUMN IF NOT EXISTS event_description TEXT,
ADD COLUMN IF NOT EXISTS event_date TEXT,
ADD COLUMN IF NOT EXISTS event_time TEXT,
ADD COLUMN IF NOT EXISTS event_location TEXT,
ADD COLUMN IF NOT EXISTS event_cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS team_id UUID; 