export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

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
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionTypeData = await request.json();
    const newSubscriptionType = await supabaseService.createSubscriptionType(subscriptionTypeData);

    return NextResponse.json(newSubscriptionType);
  } catch (error) {
    console.error("Error creating subscription type:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to create subscription type",
      details: message,
    }, { status: 500 });
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
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionTypes = await supabaseService.getSubscriptionTypes();
    return NextResponse.json(subscriptionTypes);
  } catch (error) {
    console.error("Error fetching subscription types:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to fetch subscription types",
      details: message,
    }, { status: 500 });
  }
}
