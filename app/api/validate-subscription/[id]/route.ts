import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
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

  if (!id) {
    return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
  }

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error for "Not a single row was returned"
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      throw error;
    }

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    
    // Check if subscription is active
    const now = new Date();
    const validFrom = new Date(subscription.valid_from);
    const validTo = new Date(subscription.valid_to);

    if (now < validFrom || now > validTo) {
        return NextResponse.json({
            ...subscription,
            status: "expired",
            message: "This subscription is not currently active."
        }, { status: 410 }); // 410 Gone
    }

    return NextResponse.json({
        ...subscription,
        status: "active",
        message: "This subscription is valid."
    });

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 