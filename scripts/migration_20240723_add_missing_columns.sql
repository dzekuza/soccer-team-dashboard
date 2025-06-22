ALTER TABLE public.tickets
ADD COLUMN is_validated BOOLEAN DEFAULT false,
ADD COLUMN validated_at TIMESTAMPTZ,
ADD COLUMN project_team_id UUID REFERENCES public.project_teams(id);

ALTER TABLE public.events
ADD COLUMN project_team_id UUID REFERENCES public.project_teams(id);

ALTER TABLE public.pricing_tiers
ADD COLUMN project_team_id UUID REFERENCES public.project_teams(id); 