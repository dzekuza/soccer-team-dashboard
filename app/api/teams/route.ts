import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function GET() {
  try {
    const teams = await supabaseService.getTeams();
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 