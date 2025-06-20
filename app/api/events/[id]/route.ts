import { NextRequest, NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
  }

  try {
    const event = await supabaseService.getEventWithTiers(id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    
    // Fetch teams separately
    const team1 = event.team1_id ? await supabaseService.getTeamById(event.team1_id) : null
    const team2 = event.team2_id ? await supabaseService.getTeamById(event.team2_id) : null

    return NextResponse.json({ ...event, team1, team2 })
    
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error)
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: "Failed to fetch event", details: errorMessage }, { status: 500 })
  }
} 