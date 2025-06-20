import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { createClient } from "@supabase/supabase-js"

// Helper to fetch user record with corporation_id
type SupabaseUser = { id: string; email: string }
async function getUserWithCorporationId(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, corporation_id")
    .eq("id", userId)
    .single();
  if (error || !data) throw new Error("Could not fetch user corporation_id")
  return data;
}

export async function GET(request: NextRequest) {
  // Require auth for GET
  const authHeader = request.headers.get('authorization')
  const jwt = authHeader?.split(' ')[1]
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
  }
  let userRecord
  try {
    userRecord = await getUserWithCorporationId(supabase, user.id)
  } catch (err) {
    return NextResponse.json({ error: "Could not fetch user corporation_id" }, { status: 403 })
  }
  try {
    const stats = await dbService.getEventStats(userRecord.corporation_id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
