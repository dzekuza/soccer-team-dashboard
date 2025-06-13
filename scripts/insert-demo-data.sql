-- Insert demo admin user
INSERT INTO users (email, name, password, role) VALUES 
('admin@example.com', 'Admin User', 'password123', 'admin')
ON CONFLICT (email) DO NOTHING;

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
)
ON CONFLICT (id) DO NOTHING;

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
('tier_8', 'event_3', 'Family Package', 30.00, 60, 15)
ON CONFLICT (id) DO NOTHING;

-- Insert demo tickets
INSERT INTO tickets (id, event_id, tier_id, purchaser_name, purchaser_email, is_validated, validated_at, qr_code_url) VALUES 
('ticket_1', 'event_1', 'tier_1', 'John Smith', 'john.smith@email.com', true, NOW(), '/api/validate-ticket/ticket_1'),
('ticket_2', 'event_1', 'tier_2', 'Sarah Johnson', 'sarah.j@email.com', false, NULL, '/api/validate-ticket/ticket_2'),
('ticket_3', 'event_2', 'tier_4', 'Mike Wilson', 'mike.wilson@email.com', true, NOW(), '/api/validate-ticket/ticket_3'),
('ticket_4', 'event_2', 'tier_5', 'Alex Thompson', 'alex.t@student.edu', false, NULL, '/api/validate-ticket/ticket_4'),
('ticket_5', 'event_3', 'tier_7', 'Maria Rodriguez', 'maria.r@email.com', false, NULL, '/api/validate-ticket/ticket_5')
ON CONFLICT (id) DO NOTHING;
