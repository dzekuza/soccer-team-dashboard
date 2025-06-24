import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const teamKey = searchParams.get("team_key");
  let query = supabaseAdmin.from("standings_al").select("*").order("position", { ascending: true });
  if (teamKey) {
    query = query.eq("team_key", teamKey);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // TODO: Add admin check
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("standings_al").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
} 