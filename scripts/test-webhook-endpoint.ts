import dotenv from "dotenv";

dotenv.config();

async function testWebhookEndpoint() {
  console.log('🧪 Testing Webhook Endpoint Accessibility...\n');

  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/stripe`;
  
  console.log(`📡 Testing webhook endpoint: ${webhookUrl}`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({ test: true })
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 400) {
      console.log('✅ Endpoint is accessible (400 is expected for invalid signature)');
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Error testing webhook endpoint:', error);
  }

  console.log('\n📋 Next steps:');
  console.log('1. Make sure your Stripe webhook is configured to call this endpoint');
  console.log('2. The webhook URL should be: ' + webhookUrl);
  console.log('3. Events to listen for: checkout.session.completed');
  console.log('4. Check Stripe dashboard > Webhooks to verify configuration');
}

testWebhookEndpoint().catch(console.error);