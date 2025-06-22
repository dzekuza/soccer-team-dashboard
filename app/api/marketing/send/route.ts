import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
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
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // You might want to add role-based access control here
    // to ensure only admins can send bulk emails.

    const { recipients, subject, htmlBody, textBody } = await request.json();

    if (!recipients || recipients.length === 0 || !subject || (!htmlBody && !textBody)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send the email first
    await notificationService.sendBulkEmail({
      to: recipients,
      subject,
      htmlBody,
      textBody,
    });

    // Then, save the campaign to the database
    const { error: insertError } = await supabase
      .from("marketing_campaigns")
      .insert({
        subject,
        body_html: htmlBody,
        body_text: textBody,
        recipient_count: recipients.length,
        owner_id: user.id,
      });

    if (insertError) {
      // Log the error, but don't fail the request since the email was already sent
      console.error("Failed to save marketing campaign:", insertError);
    }

    return NextResponse.json({ success: true, message: "Emails are being sent." });

  } catch (error) {
    console.error('Error in /api/marketing/send:', error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to send emails", details: message }, { status: 500 });
  }
}

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
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch campaigns", details: message }, { status: 500 });
  }
} 