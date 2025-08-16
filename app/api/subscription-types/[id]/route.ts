export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const subscriptionTypeData = await request.json();
    const updatedSubscriptionType = await supabaseService.updateSubscriptionType(
      params.id,
      subscriptionTypeData
    );

    return NextResponse.json(updatedSubscriptionType);
  } catch (error) {
    console.error("Error updating subscription type:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to update subscription type",
      details: message,
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const success = await supabaseService.deleteSubscriptionType(params.id);

    if (!success) {
      return NextResponse.json({
        error: "Subscription type not found or could not be deleted",
      }, { status: 404 });
    }

    return NextResponse.json({ message: "Subscription type deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription type:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to delete subscription type",
      details: message,
    }, { status: 500 });
  }
}
