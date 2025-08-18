import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabase-service";
import { generateSubscriptionPDF } from "@/lib/pdf-generator";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    
    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    const subscription = await supabaseService.getSubscriptionById(subscriptionId);
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Prepare PDF payload
    const pdfPayload = {
      id: subscription.id,
      purchaser_name: subscription.purchaser_name || "Nenurodyta",
      purchaser_surname: subscription.purchaser_surname || "",
      purchaser_email: subscription.purchaser_email || "Nenurodyta",
      qr_code_url: subscription.id, // Use subscription ID for QR code
      valid_from: subscription.valid_from,
      valid_to: subscription.valid_to,
    };

    // Generate PDF
    const pdfBytes = await generateSubscriptionPDF(pdfPayload);
    
    // Create filename
    const filename = `subscription-${subscription.id}.pdf`;

    // Return PDF as response
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating subscription PDF:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to generate subscription PDF",
      details: message,
    }, { status: 500 });
  }
}
