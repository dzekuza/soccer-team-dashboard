import { type NextRequest, NextResponse } from "next/server";
import { generateSubscriptionPDF } from "@/lib/pdf-generator";
import { Resend } from "resend";
import { supabaseService } from "@/lib/supabase-service";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      purchaser_name,
      purchaser_surname,
      purchaser_email,
      valid_from,
      valid_to,
      owner_id // Expect owner_id from client
    } = await req.json();

    if (!purchaser_name || !purchaser_surname || !purchaser_email || !valid_from || !valid_to || !owner_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert fan record
    await supabase.from('fans').upsert({
      email: purchaser_email,
      name: purchaser_name,
      surname: purchaser_surname
    }, { onConflict: 'email' });

    // Create subscription using the service
    const newSubscription = await supabaseService.createSubscription({
      purchaser_name,
      purchaser_surname,
      purchaser_email,
      valid_from: new Date(valid_from).toISOString(),
      valid_to: new Date(valid_to).toISOString(),
      owner_id: owner_id, 
    });

    if (!newSubscription) {
      throw new Error('Failed to create subscription in service.');
    }
    
    if (!newSubscription.purchaser_name || !newSubscription.purchaser_surname || !newSubscription.purchaser_email) {
        throw new Error('Newly created subscription is missing required purchaser details for PDF generation.');
    }

    const qr_code_url = `/api/validate-subscription/${newSubscription.id}`;
    const pdf_file_name = `subscription-${newSubscription.id}.pdf`;
    const pdfBytes = await generateSubscriptionPDF({
      ...newSubscription,
      purchaser_name: newSubscription.purchaser_name,
      purchaser_surname: newSubscription.purchaser_surname,
      purchaser_email: newSubscription.purchaser_email,
      qr_code_url: qr_code_url,
    });
    
    return NextResponse.json(newSubscription);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Subscription creation failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  const subscriptions = await supabaseService.getSubscriptions();
  return NextResponse.json(subscriptions || []);
} 