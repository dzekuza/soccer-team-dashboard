#!/usr/bin/env tsx

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  // Verify environment variables are loaded
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('💡 Make sure you have a .env.local file with your Stripe keys');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded successfully');
  console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...`);
  console.log(`   Publishable Key: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 20)}...\n`);

  try {
    // Test 1: Verify API key is working
    console.log('1. Testing API key...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ API key is valid');
    console.log(`   Account: ${account.business_profile?.name || 'Test Account'}\n`);

    // Test 2: Create a test product
    console.log('2. Testing product creation...');
    const product = await stripe.products.create({
      name: 'Test Product',
      description: 'Test product for integration verification',
    });
    console.log('✅ Product created successfully');
    console.log(`   Product ID: ${product.id}\n`);

    // Test 3: Create a test price
    console.log('3. Testing price creation...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // €10.00
      currency: 'eur',
    });
    console.log('✅ Price created successfully');
    console.log(`   Price ID: ${price.id}\n`);

    // Test 4: Create a test checkout session
    console.log('4. Testing checkout session creation...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test-cancel`,
    });
    console.log('✅ Checkout session created successfully');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Checkout URL: ${session.url}\n`);

    // Test 5: Test subscription creation
    console.log('5. Testing subscription creation...');
    const subscriptionPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // €10.00
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
    });

    const subscriptionSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: subscriptionPrice.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/test-cancel`,
    });
    console.log('✅ Subscription session created successfully');
    console.log(`   Session ID: ${subscriptionSession.id}`);
    console.log(`   Checkout URL: ${subscriptionSession.url}\n`);

    // Test 6: Verify webhook endpoint
    console.log('6. Testing webhook configuration...');
    const webhooks = await stripe.webhookEndpoints.list();
    const webhookEndpoint = webhooks.data.find(
      (webhook) => webhook.url.includes('/api/webhook/stripe')
    );
    
    if (webhookEndpoint) {
      console.log('✅ Webhook endpoint found');
      console.log(`   URL: ${webhookEndpoint.url}`);
      console.log(`   Status: ${webhookEndpoint.status}`);
    } else {
      console.log('⚠️  Webhook endpoint not found');
      console.log('   Please configure webhook at: https://dashboard.stripe.com/webhooks');
    }

    console.log('\n🎉 All tests passed! Stripe integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up webhook endpoint in Stripe Dashboard');
    console.log('   2. Add webhook secret to STRIPE_WEBHOOK_SECRET');
    console.log('   3. Test the full payment flow');
    console.log('   4. Verify webhook events are being received');

  } catch (error: any) {
    console.error('❌ Stripe integration test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n💡 Make sure your STRIPE_SECRET_KEY is correct');
    } else if (error.type === 'StripeInvalidRequestError') {
      console.error('\n💡 Check your Stripe account configuration');
    }
    
    process.exit(1);
  }
}

// Run the test
testStripeIntegration();