import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
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
    }
  );

  try {
    const { subject, body_html } = await request.json();
    if (!subject || !body_html) {
      return NextResponse.json(
        { error: "Missing subject or body_html" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("email_templates")
      .update({ subject, body_html, updated_at: new Date().toISOString() })
      .eq("name", params.name)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating template ${params.name}:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update template", details: message },
      { status: 500 }
    );
  }
} 