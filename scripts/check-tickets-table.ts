import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTicketsTable() {
  console.log('🔍 Checking Tickets Table Structure...\n');

  try {
    // 1. Test inserting a ticket with stripe_session_id
    console.log('1. Testing ticket insert with stripe_session_id...');
    const { data: testInsert, error: insertError } = await supabaseAdmin
      .from('tickets')
      .insert({
        purchaser_name: 'Test User',
        purchaser_email: 'test@example.com',
        status: 'valid',
        stripe_session_id: 'cs_test_' + Math.random().toString(36).substring(2)
      })
      .select('id, stripe_session_id')
      .single();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      if (insertError.message.includes('stripe_session_id')) {
        console.log('\n📝 The stripe_session_id column is missing!');
        console.log('   Please run: npm run print-tickets-migration');
        console.log('   Then execute the SQL in your Supabase dashboard');
      } else if (insertError.message.includes('foreign key')) {
        console.log('\n📝 Foreign key constraint failed - this is expected for test data');
        console.log('   The stripe_session_id column should work with real data');
      }
    } else {
      console.log('✅ Insert successful!');
      console.log(`   Ticket ID: ${testInsert.id}`);
      console.log(`   Session ID: ${testInsert.stripe_session_id}`);
      
      // Clean up
      await supabaseAdmin
        .from('tickets')
        .delete()
        .eq('id', testInsert.id);
      console.log('✅ Test record cleaned up');
    }

    // 2. Test fetching by session ID
    console.log('\n2. Testing fetch by session ID...');
    const testSessionId = 'cs_test_' + Math.random().toString(36).substring(2);
    const { data: fetchedTickets, error: fetchError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('stripe_session_id', testSessionId);

    if (fetchError) {
      console.log('❌ Fetch failed:', fetchError.message);
    } else {
      console.log(`✅ Fetch successful - found ${fetchedTickets?.length || 0} tickets`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }

  console.log('\n🎉 Table structure check completed!');
}

checkTicketsTable().catch(console.error);