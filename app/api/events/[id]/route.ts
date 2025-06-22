import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }

  try {
    const event = await supabaseService.getEventWithTiers(id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    
    // Fetch teams separately
    const team1 = event.team1Id
      ? await supabaseService.getTeamById(event.team1Id)
      : null
    const team2 = event.team2Id
      ? await supabaseService.getTeamById(event.team2Id)
      : null

    return NextResponse.json({ event, team1, team2 })
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error)
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json(
      { error: "Failed to fetch event", details: errorMessage },
      { status: 500 },
    )
  }
} 