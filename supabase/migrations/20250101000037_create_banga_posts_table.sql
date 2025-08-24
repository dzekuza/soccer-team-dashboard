-- Create banga_posts table for storing scraped posts from FK Banga website
CREATE TABLE IF NOT EXISTS banga_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banga_posts_published_date ON banga_posts(published_date);
CREATE INDEX IF NOT EXISTS idx_banga_posts_title ON banga_posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_banga_posts_content ON banga_posts USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE banga_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON banga_posts
  FOR SELECT USING (true);

CREATE POLICY "Admin insert access" ON banga_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update access" ON banga_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete access" ON banga_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_banga_posts_updated_at 
  BEFORE UPDATE ON banga_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
