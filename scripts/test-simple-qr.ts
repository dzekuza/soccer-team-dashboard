import { createClient } from '@supabase/supabase-js';
import qr from 'qrcode';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSimpleQR() {
  try {
    console.log('🧪 Testing simple QR code functionality...');

    // Get a ticket to test with
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id, 
        purchaser_email, 
        purchaser_name,
        is_validated,
        event:events (id, title, date, time, location),
        pricing_tier:pricing_tiers (id, name, price)
      `)
      .limit(1);

    if (ticketsError || !tickets || tickets.length === 0) {
      console.error('❌ No tickets found for testing');
      return;
    }

    const testTicket = tickets[0];
    console.log(`✅ Found ticket: ${testTicket.id}`);
    console.log(`🎭 Event: ${testTicket.event.title}`);
    console.log(`📅 Date: ${testTicket.event.date}`);
    console.log(`✅ Validated: ${testTicket.is_validated}`);

    // Test QR code generation with simple ticket ID
    console.log('\n📱 Testing QR code generation...');
    const qrCodeValue = testTicket.id; // Just the ticket ID
    
    try {
      const qrCodeDataUrl = await qr.toDataURL(qrCodeValue, { 
        width: 300, 
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0A165B',
          light: '#FFFFFF'
        }
      });
      
      console.log('✅ QR code generated successfully');
      console.log(`📏 QR code contains: ${qrCodeValue}`);
      console.log(`🔗 QR code data URL: ${qrCodeDataUrl.substring(0, 50)}...`);

      // Test QR code validation API
      console.log('\n🌐 Testing QR code validation API...');
      try {
        const response = await fetch('http://localhost:3000/api/validate-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qrData: qrCodeValue }),
        });

        const result = await response.json();
        console.log(`📡 API Response Status: ${response.status}`);
        console.log(`📡 API Response:`, result);

        if (response.ok) {
          console.log('✅ QR code validation API working correctly');
          console.log(`🎫 Ticket validated: ${result.data.ticketId}`);
          console.log(`🎭 Event: ${result.data.eventTitle}`);
          console.log(`👤 Purchaser: ${result.data.purchaserName}`);
        } else {
          console.log('❌ QR code validation API returned error');
          console.log(`❌ Error: ${result.error}`);
          console.log(`❌ Details: ${result.details}`);
        }
      } catch (error) {
        console.error('❌ Error calling QR validation API:', error);
      }

      // Test second scan (should fail for tickets)
      console.log('\n🔄 Testing second scan (should fail for tickets)...');
      try {
        const response2 = await fetch('http://localhost:3000/api/validate-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qrData: qrCodeValue }),
        });

        const result2 = await response2.json();
        console.log(`📡 Second scan - Status: ${response2.status}`);
        console.log(`📡 Second scan - Response:`, result2);

        if (response2.status === 400 && result2.error === "This ticket already scanned") {
          console.log('✅ Second scan correctly rejected - ticket already used');
        } else {
          console.log('❌ Second scan should have been rejected');
        }
      } catch (error) {
        console.error('❌ Error calling QR validation API for second scan:', error);
      }

    } catch (qrError) {
      console.error('❌ Error generating QR code:', qrError);
    }

    // Test subscription QR code
    console.log('\n📋 Testing subscription QR code...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);

    if (!subsError && subscriptions && subscriptions.length > 0) {
      const testSubscription = subscriptions[0];
      console.log(`✅ Found subscription: ${testSubscription.id}`);
      console.log(`📅 Valid from: ${testSubscription.valid_from}`);
      console.log(`📅 Valid to: ${testSubscription.valid_to}`);

      // Test subscription QR code
      const subQrCodeValue = testSubscription.id;
      
      try {
        const response = await fetch('http://localhost:3000/api/validate-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qrData: subQrCodeValue }),
        });

        const result = await response.json();
        console.log(`📡 Subscription validation - Status: ${response.status}`);
        console.log(`📡 Subscription validation - Response:`, result);

        if (response.ok) {
          console.log('✅ Subscription QR code validation working');
        } else {
          console.log('❌ Subscription validation failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Error validating subscription QR code:', error);
      }
    }

    console.log('\n🎉 Simple QR code test completed!');
    console.log('\n📋 Summary:');
    console.log('• QR codes now contain only the ID (ticket ID or subscription ID)');
    console.log('• Tickets become invalid after first scan');
    console.log('• Subscriptions remain valid until expiration date');
    console.log('• Clear error messages for different scenarios');

  } catch (error) {
    console.error('❌ Error in testSimpleQR:', error);
  }
}

// Run the test
testSimpleQR();
