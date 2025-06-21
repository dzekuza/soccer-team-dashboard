export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateSubscriptionPDF } from "@/lib/pdf-generator";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      purchaser_name,
      purchaser_surname,
      purchaser_email,
      valid_from,
      valid_to,
    } = body;

    if (
      !purchaser_name ||
      !purchaser_surname ||
      !purchaser_email ||
      !valid_from ||
      !valid_to
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // 1. Create initial subscription to get an ID
    const { data: newSubscription, error: createError } = await supabase
      .from("subscriptions")
      .insert([
        {
          purchaser_name,
          purchaser_surname,
          purchaser_email,
          valid_from: new Date(valid_from).toISOString(),
          valid_to: new Date(valid_to).toISOString(),
          owner_id: user.id, // Use authenticated user's ID
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating subscription record:", createError);
      throw createError;
    }
    
    // 2. Generate final QR code and PDF URLs
    const qr_code_url = `https://soccer-team-dashboard.vercel.app/api/validate-subscription/${newSubscription.id}`;
    const pdf_file_name = `subscription-${newSubscription.id}.pdf`;
    
    // 3. Generate PDF
    let pdfBytes;
    try {
      pdfBytes = await generateSubscriptionPDF({
        ...newSubscription,
        qr_code_url,
      });
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      // We will proceed without a PDF if generation fails.
    }
    
    // 4. Upload PDF to storage
    if (pdfBytes) {
      try {
        const { error: uploadError } = await supabase.storage
          .from("subscription-pdfs")
          .upload(pdf_file_name, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          console.error("Error uploading PDF to storage:", uploadError);
          // Don't throw, just log the error and continue.
        }
      } catch (uploadCatchError) {
        console.error("Caught exception during PDF upload:", uploadCatchError);
      }
    }
    
    // 5. Update subscription with QR code URL
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update({ qr_code_url })
      .eq("id", newSubscription.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    // 6. Send email with PDF
    if (pdfBytes) {
      await resend.emails.send({
        from: "noreply@soccer-team-dashboard.com",
        to: purchaser_email,
        subject: "Jūsų prenumeratos patvirtinimas",
        html: `
          <h1>Sveiki, ${purchaser_name}!</h1>
          <p>Dėkojame, kad įsigijote prenumeratą. Prisegame jūsų PDF patvirtinimą.</p>
        `,
        attachments: [
          {
            filename: pdf_file_name,
            content: Buffer.from(pdfBytes),
          },
        ],
      });
    }

    return NextResponse.json(updatedSubscription || newSubscription);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Subscription creation failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, purchaser_name, purchaser_surname, purchaser_email, valid_from, valid_to");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
} 