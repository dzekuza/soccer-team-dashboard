# Environment Variables for Vercel Deployment

This document lists all the required environment variables that need to be configured in your Vercel project settings.

## Required Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Stripe Configuration (if using payments)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Email Configuration (if using email features)
```
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Redis Configuration (if using Redis)
```
REDIS_URL=your_redis_url
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with the appropriate value
4. Make sure to set the environment (Production, Preview, Development) as needed

## Important Notes

- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` should be kept secret and only used server-side
- Make sure your Supabase project has the correct RLS policies configured
- Test your deployment in a preview environment first

## Database Setup

Make sure your Supabase database has all the required tables and RLS policies:

- `posts` table with proper RLS policies
- `events` table
- `tickets` table
- `subscriptions` table
- And other tables as needed for your application

## Post-Deployment Checklist

1. ✅ Verify all environment variables are set correctly
2. ✅ Test the main functionality (posts, events, tickets, etc.)
3. ✅ Check that the scanner page works correctly
4. ✅ Verify that the `/naujienos` page loads posts correctly
5. ✅ Test admin dashboard functionality
6. ✅ Check that all API endpoints are working
