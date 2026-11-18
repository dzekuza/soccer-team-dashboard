-- Public pages (home, results, schedule) read fixtures with the anon key.
-- Without this only the row owner could see a fixture. Drafts stay private.
CREATE POLICY "Anyone can view published fixtures" ON public.fixtures_all_new
  FOR SELECT USING (is_draft = false);
