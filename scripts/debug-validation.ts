import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugValidation() {
  try {
    console.log('🔍 Debugging ticket validation logic...');

    const ticketId = '78e8d495-0f5d-4a81-968e-ceae6fa70ce6';

    // Check initial status
    console.log('\n📋 Checking initial ticket status...');
    const { data: initialTicket, error: initialError } = await supabase
      .from('tickets')
      .select('id, is_validated, validated_at')
      .eq('id', ticketId)
      .single();

    if (initialError) {
      console.error('❌ Error fetching ticket:', initialError);
      return;
    }

    console.log(`Initial status:`);
    console.log(`  ID: ${initialTicket.id}`);
    console.log(`  Validated: ${initialTicket.is_validated}`);
    console.log(`  Validated at: ${initialTicket.validated_at}`);

    // Reset to unvalidated
    console.log('\n🔄 Resetting ticket to unvalidated...');
    const { error: resetError } = await supabase
      .from('tickets')
      .update({ 
        is_validated: false, 
        validated_at: null 
      })
      .eq('id', ticketId);

    if (resetError) {
      console.error('❌ Error resetting ticket:', resetError);
      return;
    }

    console.log('✅ Ticket reset successfully');

    // Check status after reset
    console.log('\n📋 Checking status after reset...');
    const { data: resetTicket, error: resetCheckError } = await supabase
      .from('tickets')
      .select('id, is_validated, validated_at')
      .eq('id', ticketId)
      .single();

    if (resetCheckError) {
      console.error('❌ Error checking reset ticket:', resetCheckError);
      return;
    }

    console.log(`After reset:`);
    console.log(`  ID: ${resetTicket.id}`);
    console.log(`  Validated: ${resetTicket.is_validated}`);
    console.log(`  Validated at: ${resetTicket.validated_at}`);

    // Test first validation
    console.log('\n🎫 Testing first validation...');
    const { error: validateError } = await supabase
      .from('tickets')
      .update({ 
        is_validated: true, 
        validated_at: new Date().toISOString() 
      })
      .eq('id', ticketId);

    if (validateError) {
      console.error('❌ Error validating ticket:', validateError);
      return;
    }

    console.log('✅ First validation successful');

    // Check status after first validation
    console.log('\n📋 Checking status after first validation...');
    const { data: validatedTicket, error: validatedCheckError } = await supabase
      .from('tickets')
      .select('id, is_validated, validated_at')
      .eq('id', ticketId)
      .single();

    if (validatedCheckError) {
      console.error('❌ Error checking validated ticket:', validatedCheckError);
      return;
    }

    console.log(`After first validation:`);
    console.log(`  ID: ${validatedTicket.id}`);
    console.log(`  Validated: ${validatedTicket.is_validated}`);
    console.log(`  Validated at: ${validatedTicket.validated_at}`);

    // Test second validation attempt
    console.log('\n🔄 Testing second validation attempt...');
    const { error: secondValidateError } = await supabase
      .from('tickets')
      .update({ 
        is_validated: true, 
        validated_at: new Date().toISOString() 
      })
      .eq('id', ticketId);

    if (secondValidateError) {
      console.error('❌ Error in second validation:', secondValidateError);
    } else {
      console.log('⚠️ Second validation succeeded (this should not happen)');
    }

    // Check final status
    console.log('\n📋 Checking final status...');
    const { data: finalTicket, error: finalCheckError } = await supabase
      .from('tickets')
      .select('id, is_validated, validated_at')
      .eq('id', ticketId)
      .single();

    if (finalCheckError) {
      console.error('❌ Error checking final ticket:', finalCheckError);
      return;
    }

    console.log(`Final status:`);
    console.log(`  ID: ${finalTicket.id}`);
    console.log(`  Validated: ${finalTicket.is_validated}`);
    console.log(`  Validated at: ${finalTicket.validated_at}`);

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Error in debugValidation:', error);
  }
}

// Run the debug
debugValidation();
