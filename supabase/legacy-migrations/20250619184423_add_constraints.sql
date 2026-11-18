-- Add sold_quantity column to pricing_tiers if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pricing_tiers' 
    AND column_name = 'sold_quantity') THEN
    ALTER TABLE public.pricing_tiers ADD COLUMN sold_quantity integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add constraints to pricing_tiers
ALTER TABLE public.pricing_tiers
  ADD CONSTRAINT check_price_positive CHECK (price > 0),
  ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT check_sold_quantity_non_negative CHECK (sold_quantity >= 0),
  ADD CONSTRAINT check_sold_quantity_within_max CHECK (sold_quantity <= quantity);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for events
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for pricing_tiers
DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON pricing_tiers;
CREATE TRIGGER update_pricing_tiers_updated_at
    BEFORE UPDATE ON pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 