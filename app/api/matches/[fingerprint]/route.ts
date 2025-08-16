import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { fingerprint: string } },
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
      return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
    }

    const matchData = await request.json();
    const { fingerprint } = params;

    const { data, error } = await supabase
      .from("fixtures_all_new")
      .update(matchData)
      .eq("fingerprint", fingerprint)
      .eq("owner_id", user.id) // Ensure only the owner can update
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({
          error: "Rungtynės nerastos arba neturite teisių jas redaguoti",
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating match ${params.fingerprint}:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Nepavyko atnaujinti rungtynių",
      details: message,
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fingerprint: string } },
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
      return NextResponse.json({ error: "Neautorizuota" }, { status: 401 });
    }

    const { fingerprint } = params;

    const { error } = await supabase
      .from("fixtures_all_new")
      .delete()
      .eq("fingerprint", fingerprint)
      .eq("owner_id", user.id); // Ensure only the owner can delete

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Rungtynės ${fingerprint} ištrintos`,
    });
  } catch (error) {
    console.error(`Error deleting match ${params.fingerprint}:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Nepavyko ištrinti rungtynių",
      details: message,
    }, { status: 500 });
  }
}
