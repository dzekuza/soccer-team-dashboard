export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function GET() {
  try {
    const subscriptionTypes = await supabaseService.getSubscriptionTypes();
    
    // Filter to only return active subscription types for public access
    const activeSubscriptionTypes = subscriptionTypes.filter(type => type.is_active);
    
    return NextResponse.json(activeSubscriptionTypes);
  } catch (error) {
    console.error("Error fetching public subscription types:", error);
    const message = error instanceof Error
      ? error.message
      : "Internal Server Error";
    return NextResponse.json({
      error: "Failed to fetch subscription types",
      details: message,
    }, { status: 500 });
  }
}
