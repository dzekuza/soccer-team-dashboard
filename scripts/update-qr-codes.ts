import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { QRCodeService } from '../lib/qr-code-service';

// Load environment variables
config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function updateAllTicketQRCodes() {
  console.log('Starting QR code update process...');

  try {
    // Get all tickets that need QR code updates
    const { data: tickets, error } = await supabaseAdmin
      .from("tickets")
      .select(`
        id,
        qr_code_url,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      return;
    }

    // Filter tickets that have legacy QR codes (just IDs)
    const ticketsNeedingUpdate = tickets.filter(ticket => {
      // Check if QR code URL is just a simple ID or legacy format
      return !ticket.qr_code_url || 
             ticket.qr_code_url.length < 100 || // Legacy QR codes are shorter
             ticket.qr_code_url.startsWith('data:image/png;base64,') === false;
    });

    console.log(`Found ${ticketsNeedingUpdate.length} tickets needing QR code updates out of ${tickets.length} total tickets`);

    if (ticketsNeedingUpdate.length === 0) {
      console.log('All tickets already have enhanced QR codes!');
      return;
    }

    const results = [];
    const errors = [];

    for (const ticket of ticketsNeedingUpdate) {
      try {
        console.log(`Processing ticket ${ticket.id}...`);

        // Fetch ticket with full details
        const { data: ticketWithDetails, error: fetchError } = await supabaseAdmin
          .from("tickets")
          .select(`
            *,
            event:events (*),
            pricing_tier:pricing_tiers (*)
          `)
          .eq("id", ticket.id)
          .single();

        if (fetchError || !ticketWithDetails) {
          errors.push({
            ticketId: ticket.id,
            error: "Ticket not found or fetch error"
          });
          continue;
        }

        // Generate enhanced QR code
        const ticketForQR = {
          id: ticketWithDetails.id,
          eventId: ticketWithDetails.event_id,
          tierId: ticketWithDetails.tier_id,
          purchaserName: ticketWithDetails.purchaser_name,
          purchaserEmail: ticketWithDetails.purchaser_email,
          isValidated: ticketWithDetails.is_validated,
          createdAt: ticketWithDetails.created_at,
          validatedAt: ticketWithDetails.validated_at,
          qrCodeUrl: ticketWithDetails.qr_code_url,
          event: ticketWithDetails.event,
          tier: ticketWithDetails.pricing_tier,
        };

        const enhancedQRCodeUrl = await QRCodeService.updateTicketQRCode(ticketForQR);

        // Update ticket with new QR code
        const { error: updateError } = await supabaseAdmin
          .from("tickets")
          .update({
            qr_code_url: enhancedQRCodeUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ticket.id);

        if (updateError) {
          errors.push({
            ticketId: ticket.id,
            error: `Failed to update QR code: ${updateError.message}`
          });
        } else {
          results.push({
            ticketId: ticket.id,
            success: true,
            message: "QR code updated successfully"
          });
          console.log(`✅ Updated QR code for ticket ${ticket.id}`);
        }
      } catch (error) {
        errors.push({
          ticketId: ticket.id,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        console.error(`❌ Error processing ticket ${ticket.id}:`, error);
      }
    }

    // Print summary
    console.log('\n=== QR Code Update Summary ===');
    console.log(`Total tickets processed: ${ticketsNeedingUpdate.length}`);
    console.log(`Successful updates: ${results.length}`);
    console.log(`Failed updates: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(error => {
        console.log(`Ticket ${error.ticketId}: ${error.error}`);
      });
    }

    if (results.length > 0) {
      console.log('\n=== Successfully Updated ===');
      results.forEach(result => {
        console.log(`✅ Ticket ${result.ticketId}`);
      });
    }

  } catch (error) {
    console.error('Error in updateAllTicketQRCodes:', error);
  }
}

async function updateAllSubscriptionQRCodes() {
  console.log('\nStarting subscription QR code update process...');

  try {
    // Get all subscriptions
    const { data: subscriptions, error } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        qr_code_url,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return;
    }

    // Filter subscriptions that have legacy QR codes
    const subscriptionsNeedingUpdate = subscriptions.filter(subscription => {
      return !subscription.qr_code_url || 
             subscription.qr_code_url.length < 100 ||
             subscription.qr_code_url.startsWith('data:image/png;base64,') === false;
    });

    console.log(`Found ${subscriptionsNeedingUpdate.length} subscriptions needing QR code updates out of ${subscriptions.length} total subscriptions`);

    if (subscriptionsNeedingUpdate.length === 0) {
      console.log('All subscriptions already have enhanced QR codes!');
      return;
    }

    const results = [];
    const errors = [];

    for (const subscription of subscriptionsNeedingUpdate) {
      try {
        console.log(`Processing subscription ${subscription.id}...`);

        // Fetch subscription with full details
        const { data: subscriptionWithDetails, error: fetchError } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("id", subscription.id)
          .single();

        if (fetchError || !subscriptionWithDetails) {
          errors.push({
            subscriptionId: subscription.id,
            error: "Subscription not found or fetch error"
          });
          continue;
        }

        // Generate enhanced QR code
        const enhancedQRCodeUrl = await QRCodeService.updateSubscriptionQRCode({
          id: subscriptionWithDetails.id,
          purchaser_name: subscriptionWithDetails.purchaser_name,
          purchaser_surname: subscriptionWithDetails.purchaser_surname,
          purchaser_email: subscriptionWithDetails.purchaser_email,
          valid_from: subscriptionWithDetails.valid_from,
          valid_to: subscriptionWithDetails.valid_to,
          created_at: subscriptionWithDetails.created_at,
        });

        // Update subscription with new QR code
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            qr_code_url: enhancedQRCodeUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);

        if (updateError) {
          errors.push({
            subscriptionId: subscription.id,
            error: `Failed to update QR code: ${updateError.message}`
          });
        } else {
          results.push({
            subscriptionId: subscription.id,
            success: true,
            message: "QR code updated successfully"
          });
          console.log(`✅ Updated QR code for subscription ${subscription.id}`);
        }
      } catch (error) {
        errors.push({
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        console.error(`❌ Error processing subscription ${subscription.id}:`, error);
      }
    }

    // Print summary
    console.log('\n=== Subscription QR Code Update Summary ===');
    console.log(`Total subscriptions processed: ${subscriptionsNeedingUpdate.length}`);
    console.log(`Successful updates: ${results.length}`);
    console.log(`Failed updates: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(error => {
        console.log(`Subscription ${error.subscriptionId}: ${error.error}`);
      });
    }

  } catch (error) {
    console.error('Error in updateAllSubscriptionQRCodes:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting QR Code Enhancement Process...\n');
  
  await updateAllTicketQRCodes();
  await updateAllSubscriptionQRCodes();
  
  console.log('\n🎉 QR Code enhancement process completed!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { updateAllTicketQRCodes, updateAllSubscriptionQRCodes };
