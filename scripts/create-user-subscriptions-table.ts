#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUserSubscriptionsTable() {
  console.log('🔧 Creating User Subscriptions Table...\n');

  try {
    // First, let's check if the table already exists
    console.log('1. Checking if user_subscriptions table exists...');
    const { data: existingTable, error: checkError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('count')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ User_subscriptions table already exists');
      return;
    }

    console.log('❌ Table does not exist, creating it...\n');

    // Since we can't execute raw SQL through the client, let's create the table
    // by trying to insert a record and see what columns are missing
    console.log('2. Testing table structure...');
    
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000',
      subscription_id: '00000000-0000-0000-0000-000000000000',
      stripe_subscription_id: 'sub_test_creation',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      customer_email: 'test@example.com',
      purchase_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert(testRecord);

    if (insertError) {
      console.log('❌ Could not insert test record:', insertError.message);
      console.log('💡 The table might need to be created manually in the Supabase dashboard');
      console.log('\n📋 Required SQL to run in Supabase SQL Editor:');
      console.log(`
-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  customer_email TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_email ON user_subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dates ON user_subscriptions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id ON user_subscriptions(subscription_id);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Select own user_subscriptions" ON user_subscriptions 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Insert own user_subscriptions" ON user_subscriptions 
FOR INSERT WITH CHECK (user_id = auth.uid());
      `);
    } else {
      console.log('✅ Table structure supports Stripe integration');
      
      // Clean up test record
      await supabaseAdmin
        .from('user_subscriptions')
        .delete()
        .eq('stripe_subscription_id', 'sub_test_creation');
    }

    console.log('\n🎉 User subscriptions table setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. If the table was created, you can now test the Stripe integration');
    console.log('   2. If not, run the SQL above in your Supabase SQL Editor');
    console.log('   3. Test the subscription flow at /checkout/subscription');

  } catch (error: any) {
    console.error('❌ Failed to create user_subscriptions table:');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
createUserSubscriptionsTable();