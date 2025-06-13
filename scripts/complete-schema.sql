-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS pricing_tiers CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_tiers table
CREATE TABLE pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    max_quantity INTEGER NOT NULL CHECK (max_quantity > 0),
    sold_quantity INTEGER DEFAULT 0 CHECK (sold_quantity >= 0)
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES pricing_tiers(id) ON DELETE CASCADE,
    purchaser_name VARCHAR(255) NOT NULL,
    purchaser_email VARCHAR(255) NOT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_at TIMESTAMP WITH TIME ZONE NULL,
    qr_code_url TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_pricing_tiers_event_id ON pricing_tiers(event_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_tier_id ON tickets(tier_id);
CREATE INDEX idx_tickets_validated ON tickets(is_validated);
CREATE INDEX idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for events table
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- Insert demo admin user
INSERT INTO users (email, name, password, role) VALUES 
('admin@example.com', 'Admin User', 'password123', 'admin');

-- Insert demo events
INSERT INTO events (id, title, description, date, time, location) VALUES 
(
    'event_1',
    'Championship Final 2024',
    'The ultimate showdown! Our team faces the defending champions in this season''s final match.',
    '2024-07-15',
    '19:00',
    'Main Stadium - Downtown'
),
(
    'event_2',
    'Season Opener vs Rivals',
    'Kick off the new season with our biggest rivalry match!',
    '2024-08-01',
    '18:30',
    'Community Field - Westside'
),
(
    'event_3',
    'Youth Development Showcase',
    'Watch our youth teams in action! A special event showcasing the future stars.',
    '2024-08-15',
    '15:00',
    'Training Ground - North Campus'
);

-- Insert pricing tiers
INSERT INTO pricing_tiers (id, event_id, name, price, max_quantity, sold_quantity) VALUES 
-- Championship Final tiers
('tier_1', 'event_1', 'General Admission', 25.00, 300, 45),
('tier_2', 'event_1', 'VIP Seating', 65.00, 100, 12),
('tier_3', 'event_1', 'Premium Box', 150.00, 20, 3),

-- Season Opener tiers
('tier_4', 'event_2', 'General Admission', 20.00, 250, 67),
('tier_5', 'event_2', 'Student Discount', 15.00, 100, 23),
('tier_6', 'event_2', 'VIP Seating', 45.00, 75, 8),

-- Youth Showcase tiers
('tier_7', 'event_3', 'General Admission', 10.00, 200, 34),
('tier_8', 'event_3', 'Family Package', 30.00, 60, 15);

-- Insert demo tickets
INSERT INTO tickets (id, event_id, tier_id, purchaser_name, purchaser_email, is_validated, validated_at, qr_code_url) VALUES 
('ticket_1', 'event_1', 'tier_1', 'John Smith', 'john.smith@email.com', true, NOW(), '/api/validate-ticket/ticket_1'),
('ticket_2', 'event_1', 'tier_2', 'Sarah Johnson', 'sarah.j@email.com', false, NULL, '/api/validate-ticket/ticket_2'),
('ticket_3', 'event_2', 'tier_4', 'Mike Wilson', 'mike.wilson@email.com', true, NOW(), '/api/validate-ticket/ticket_3'),
('ticket_4', 'event_2', 'tier_5', 'Alex Thompson', 'alex.t@student.edu', false, NULL, '/api/validate-ticket/ticket_4'),
('ticket_5', 'event_3', 'tier_7', 'Maria Rodriguez', 'maria.r@email.com', false, NULL, '/api/validate-ticket/ticket_5');
