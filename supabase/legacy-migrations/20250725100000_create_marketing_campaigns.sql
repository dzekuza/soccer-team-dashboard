CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    body_html TEXT,
    body_text TEXT,
    recipient_count INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage their own campaigns"
ON marketing_campaigns
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow read access to service_role"
ON marketing_campaigns
FOR SELECT
USING (true); 