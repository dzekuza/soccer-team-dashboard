import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-service";

export async function GET(_req: NextRequest, props: { params: Promise<{ fingerprint: string }> }) {
  const params = await props.params;
  const { fingerprint } = params;
  const { data, error } = await supabaseAdmin.from("standings_al").select("*").eq("fingerprint", fingerprint).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ fingerprint: string }> }) {
  const params = await props.params;
  // TODO: Add admin check
  const { fingerprint } = params;
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("standings_al").update(body).eq("fingerprint", fingerprint).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ fingerprint: string }> }) {
  const params = await props.params;
  // TODO: Add admin check
  const { fingerprint } = params;
  const { error } = await supabaseAdmin.from("standings_al").delete().eq("fingerprint", fingerprint);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
} 