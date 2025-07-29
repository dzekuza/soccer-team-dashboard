-- Add sample subscription plans for testing
-- These will be used to test the Stripe subscription flow

INSERT INTO subscriptions (id, title, description, price, duration_days, created_at) VALUES
(
  gen_random_uuid(),
  'Basic Monthly Plan',
  'Access to all basic features including event management, ticket sales, and basic analytics.',
  29.99,
  30,
  NOW()
),
(
  gen_random_uuid(),
  'Premium Monthly Plan',
  'Everything in Basic plus advanced analytics, priority support, and custom branding.',
  59.99,
  30,
  NOW()
),
(
  gen_random_uuid(),
  'Basic Annual Plan',
  'Access to all basic features including event management, ticket sales, and basic analytics. Save 20% with annual billing.',
  287.90,
  365,
  NOW()
),
(
  gen_random_uuid(),
  'Premium Annual Plan',
  'Everything in Basic plus advanced analytics, priority support, and custom branding. Save 20% with annual billing.',
  575.90,
  365,
  NOW()
)
ON CONFLICT DO NOTHING;