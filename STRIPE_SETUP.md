# Stripe Integration Setup Guide

This guide covers the complete Stripe integration setup for the soccer team dashboard.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook secret

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Your app's base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000 # Your API base URL

# Supabase Configuration (if not already set)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Email Configuration (for notifications)
RESEND_API_KEY=your_resend_api_key
```

## Stripe Dashboard Setup

### 1. Create a Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Complete account verification

### 2. Get API Keys
1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your **Publishable key** and **Secret key**
3. Add them to your environment variables

### 3. Configure Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/webhook/stripe`
4. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode vs Live Mode
- Use **Test mode** for development
- Use **Live mode** for production
- Make sure to update your environment variables accordingly

## Database Schema Requirements

Ensure your Supabase database has the following tables:

### `user_subscriptions` table
```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `subscriptions` table (for subscription plans)
```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features Implemented

### 1. Ticket Purchases
- ✅ Stripe Checkout for one-time payments
- ✅ Webhook handling for ticket creation
- ✅ Email notifications with PDF tickets
- ✅ QR code generation for tickets

### 2. Subscription Management
- ✅ Stripe Checkout for recurring subscriptions
- ✅ Webhook handling for subscription lifecycle
- ✅ Subscription status tracking
- ✅ Email notifications for subscriptions

### 3. Payment Processing
- ✅ Card payments via Stripe Checkout
- ✅ Apple Pay / Google Pay support
- ✅ Payment intent creation for custom forms
- ✅ Secure webhook verification

## Testing the Integration

### 1. Test Card Numbers
Use these test card numbers in Stripe test mode:
- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **Declined**: `4000000000000002`

### 2. Test Webhooks
1. Use Stripe CLI to forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
2. This will give you a webhook signing secret to use in development

### 3. Test Subscription Flow
1. Go to `/checkout/subscription`
2. Select a plan and enter email
3. Complete payment with test card
4. Verify webhook processes the subscription
5. Check database for subscription record

## Security Considerations

### 1. Webhook Verification
- ✅ All webhooks are verified using Stripe's signature
- ✅ Environment variable for webhook secret
- ✅ Proper error handling for invalid signatures

### 2. API Key Security
- ✅ Secret key only used server-side
- ✅ Publishable key used client-side
- ✅ Environment variables for sensitive data

### 3. Database Security
- ✅ RLS policies for user data protection
- ✅ Service role key for admin operations
- ✅ Proper error handling and logging

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook endpoint URL is correct
   - Verify webhook secret is set correctly
   - Check server logs for errors

2. **Payment fails**
   - Verify Stripe keys are correct
   - Check currency settings (EUR)
   - Ensure proper error handling

3. **Subscription not created**
   - Check webhook is processing events
   - Verify database schema is correct
   - Check Supabase permissions

### Debug Steps

1. Check browser console for client-side errors
2. Check server logs for API errors
3. Use Stripe Dashboard to verify payments
4. Check Supabase logs for database errors

## Production Deployment

### 1. Environment Variables
- Update all URLs to production domain
- Use live mode Stripe keys
- Set proper webhook endpoint

### 2. Database
- Ensure all tables exist in production
- Set up proper RLS policies
- Configure backup and monitoring

### 3. Monitoring
- Set up Stripe Dashboard alerts
- Monitor webhook delivery
- Track payment success rates

## Support

For issues with:
- **Stripe Integration**: Check Stripe documentation
- **Database Issues**: Check Supabase logs
- **Email Delivery**: Check Resend dashboard
- **General Issues**: Check application logs