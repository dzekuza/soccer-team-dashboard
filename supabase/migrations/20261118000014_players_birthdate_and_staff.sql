-- Player extras scraped from fkbanga.lt, and a table for coaching/medical staff.
ALTER TABLE public.banga_playerss
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS profile_url text;

-- A player can be registered in two squads (e.g. A and B), so uniqueness is per squad.
CREATE UNIQUE INDEX IF NOT EXISTS idx_banga_playerss_team_profile_url
  ON public.banga_playerss (team_key, profile_url) WHERE profile_url IS NOT NULL;

CREATE TABLE public.team_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_key text NOT NULL,
  role text,
  name text NOT NULL,
  surname text,
  citizenship text,
  age integer,
  previous_teams text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_key, name, surname)
);

CREATE TRIGGER update_team_staff_updated_at
BEFORE UPDATE ON public.team_staff
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.team_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view team staff" ON public.team_staff FOR SELECT USING (true);
CREATE POLICY "Admins can manage team staff" ON public.team_staff
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
