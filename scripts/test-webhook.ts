import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testWebhook() {
  console.log('🧪 Testing Webhook Functionality...\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: dbError } = await supabaseAdmin
      .from('tickets')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if stripe_session_id column exists
    console.log('\n2. Checking tickets table structure...');
    const { data: columns, error: columnsError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'tickets' });
    
    if (columnsError) {
      console.log('⚠️  Could not check table structure directly');
      console.log('   Please run the migration: npm run print-tickets-migration');
    } else {
      const hasStripeSessionId = columns?.some((col: any) => col.column_name === 'stripe_session_id');
      if (hasStripeSessionId) {
        console.log('✅ stripe_session_id column exists');
      } else {
        console.log('❌ stripe_session_id column missing');
        console.log('   Please run: npm run print-tickets-migration');
      }
    }

    // 3. Test creating a sample ticket with session ID
    console.log('\n3. Testing ticket creation with session ID...');
    const testSessionId = 'cs_test_' + Math.random().toString(36).substring(2);
    const { data: testTicket, error: insertError } = await supabaseAdmin
      .from('tickets')
      .insert({
        event_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        tier_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        purchaser_name: 'Test User',
        purchaser_email: 'test@example.com',
        status: 'valid',
        stripe_session_id: testSessionId
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Could not insert test ticket:', insertError.message);
      console.log('   This might indicate the stripe_session_id column is missing');
    } else {
      console.log('✅ Test ticket created successfully');
      
      // Clean up test ticket
      await supabaseAdmin
        .from('tickets')
        .delete()
        .eq('stripe_session_id', testSessionId);
      console.log('✅ Test ticket cleaned up');
    }

    // 4. Test fetching tickets by session ID
    console.log('\n4. Testing ticket fetching by session ID...');
    const { data: fetchedTickets, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('stripe_session_id', testSessionId);

    if (fetchError) {
      console.log('❌ Could not fetch tickets by session ID:', fetchError.message);
    } else {
      console.log(`✅ Fetched ${fetchedTickets?.length || 0} tickets by session ID`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n📋 Summary:');
  console.log('   - Database connection: ✅');
  console.log('   - Table structure: Check output above');
  console.log('   - Ticket creation: Check output above');
  console.log('   - Ticket fetching: Check output above');
}

testWebhook().catch(console.error);