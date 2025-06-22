export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { notificationService } from "@/lib/notification-service";
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
    
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/validate-subscription/${uuidv4()}`;

    // 1. Create subscription
    const { data: newSubscription, error: createError } = await supabase
      .from("subscriptions")
      .insert([
        {
          purchaser_name,
          purchaser_surname,
          purchaser_email,
          valid_from: new Date(valid_from).toISOString(),
          valid_to: new Date(valid_to).toISOString(),
          owner_id: user.id,
          qr_code_url: qrCodeUrl,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating subscription record:", createError);
      throw createError;
    }
    
    // 2. Send email notification (fire-and-forget)
    notificationService.sendSubscriptionConfirmation(newSubscription.id);

    return NextResponse.json(newSubscription);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Subscription creation failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, purchaser_name, purchaser_surname, purchaser_email, valid_from, valid_to");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
} 