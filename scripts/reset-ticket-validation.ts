import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetTicketValidation() {
  try {
    console.log('🔄 Resetting ticket validation status for testing...');

    // Get the ticket we want to reset
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, is_validated, validated_at')
      .eq('id', '20b89207-0297-43eb-990c-9d5515681730')
      .single();

    if (ticketsError || !tickets) {
      console.error('❌ Ticket not found');
      return;
    }

    console.log(`📋 Current ticket status:`);
    console.log(`   ID: ${tickets.id}`);
    console.log(`   Validated: ${tickets.is_validated}`);
    console.log(`   Validated at: ${tickets.validated_at}`);

    // Reset the validation status
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        is_validated: false, 
        validated_at: null 
      })
      .eq('id', '20b89207-0297-43eb-990c-9d5515681730');

    if (updateError) {
      console.error('❌ Error resetting ticket validation:', updateError);
      return;
    }

    console.log('✅ Ticket validation status reset successfully');
    console.log('🎯 Ticket is now ready for testing');

  } catch (error) {
    console.error('❌ Error in resetTicketValidation:', error);
  }
}

// Run the reset
resetTicketValidation();
