-- Create coupon_codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_active ON coupon_codes(is_active, valid_from, valid_until);

-- Enable RLS
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow admins to manage coupon codes" ON coupon_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow public to view active coupon codes" ON coupon_codes
    FOR SELECT USING (
        is_active = true 
        AND (valid_until IS NULL OR valid_until > NOW())
        AND (valid_from IS NULL OR valid_from <= NOW())
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupon_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_coupon_codes_updated_at
    BEFORE UPDATE ON coupon_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_coupon_codes_updated_at();

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    max_uses_val INTEGER;
    current_uses_val INTEGER;
BEGIN
    SELECT max_uses, current_uses INTO max_uses_val, current_uses_val
    FROM coupon_codes
    WHERE id = coupon_id;
    
    -- If no max_uses limit or current_uses < max_uses, increment
    IF max_uses_val IS NULL OR current_uses_val < max_uses_val THEN
        UPDATE coupon_codes 
        SET current_uses = current_uses + 1
        WHERE id = coupon_id;
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;
