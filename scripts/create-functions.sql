-- Function to increment sold quantity
CREATE OR REPLACE FUNCTION increment_sold_quantity(tier_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pricing_tiers 
    SET sold_quantity = sold_quantity + 1 
    WHERE id = tier_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement sold quantity
CREATE OR REPLACE FUNCTION decrement_sold_quantity(tier_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE pricing_tiers 
    SET sold_quantity = GREATEST(sold_quantity - 1, 0)
    WHERE id = tier_id;
END;
$$ LANGUAGE plpgsql;
