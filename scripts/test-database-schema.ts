#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testDatabaseSchema() {
  console.log('🧪 Testing Database Schema...\n');

  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('subscriptions')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Check subscriptions table structure
    console.log("\n3. Testing subscriptions table...");
    try {
      const { data: subscriptions, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .limit(5);

      if (error) {
        console.error("❌ Error accessing subscriptions table:", error);
        return;
      }

      console.log(`✅ Subscriptions table accessible`);
      console.log(`   Found ${subscriptions?.length || 0} subscription records`);

      // Check if we have the required columns for Stripe integration
      if (subscriptions && subscriptions.length > 0) {
        const sample = subscriptions[0];
        const requiredColumns = [
          'purchaser_name', 'purchaser_email', 'valid_from', 'valid_to', 
          'stripe_subscription_id', 'subscription_status'
        ];
        
        const missingColumns = requiredColumns.filter(col => !(col in sample));
        if (missingColumns.length > 0) {
          console.log(`⚠️  Missing columns for Stripe integration: ${missingColumns.join(', ')}`);
        } else {
          console.log(`✅ All required columns for Stripe integration are present`);
        }
      }
    } catch (error) {
      console.error("❌ Error testing subscriptions table:", error);
    }

    // Test 4: Try to insert a test record to check column structure
    console.log('\n4. Testing table structure with sample data...');
    try {
      // Try to insert a test record to verify structure
      const testData = {
        purchaser_name: 'Test User',
        purchaser_email: 'test@example.com',
        valid_from: new Date().toISOString(),
        valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        stripe_subscription_id: 'test_stripe_sub_123',
        subscription_status: 'active',
        owner_id: '00000000-0000-0000-0000-000000000000' // Use a test UUID instead of email
      };

      const { error: insertError } = await supabaseAdmin
        .from('subscriptions')
        .insert(testData);

      if (insertError) {
        console.log(`⚠️  Could not insert test record: ${insertError.message}`);
        console.log(`   This might indicate missing columns for Stripe integration`);
        console.log(`   Required columns: purchaser_name, purchaser_email, valid_from, valid_to, stripe_subscription_id, subscription_status`);
      } else {
        console.log(`✅ Test record inserted successfully`);
        
        // Clean up the test record
        await supabaseAdmin
          .from('subscriptions')
          .delete()
          .eq('stripe_subscription_id', 'test_stripe_sub_123');
      }
    } catch (error) {
      console.error("❌ Error testing table structure:", error);
    }

    console.log('\n🎉 Database schema test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Database connection: ✅');
    console.log('   - Subscriptions table: ✅');
    console.log('   - Stripe integration columns: Check output above');

  } catch (error: any) {
    console.error('❌ Database schema test failed:');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testDatabaseSchema();