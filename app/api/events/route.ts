import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function GET() {
  try {
    const events = await dbService.getEventsWithTiers()
    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, time, location, pricingTiers, team1Id, team2Id } = body

    console.log("API: Creating event with data:", { title, description, date, time, location, pricingTiers, team1Id, team2Id })

    // Validate required fields
    if (!title || !description || !date || !time || !location) {
      console.error("API: Missing required event fields")
      return NextResponse.json({ error: "Missing required event fields" }, { status: 400 })
    }
    if (!team1Id || !team2Id || team1Id === team2Id) {
      return NextResponse.json({ error: "Both teams must be selected and different" }, { status: 400 })
    }

    if (!pricingTiers || !Array.isArray(pricingTiers) || pricingTiers.length === 0) {
      console.error("API: Missing or invalid pricing tiers")
      return NextResponse.json({ error: "At least one pricing tier is required" }, { status: 400 })
    }

    // Validate pricing tiers
    for (const tier of pricingTiers) {
      if (!tier.name || tier.price <= 0 || tier.maxQuantity <= 0) {
        console.error("API: Invalid pricing tier data:", tier)
        return NextResponse.json({ error: "Invalid pricing tier data" }, { status: 400 })
      }
    }

    try {
      // Create event with pricing tiers and teams
      const event = await dbService.createEvent({ title, description, date, time, location, team1Id, team2Id }, pricingTiers)
      console.log("API: Event created successfully:", event)
      return NextResponse.json(event)
    } catch (createError) {
      console.error("API: Error in dbService.createEvent:", createError)
      return NextResponse.json(
        {
          error: "Failed to create event in database",
          details: JSON.stringify(createError, Object.getOwnPropertyNames(createError)),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Error processing request:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
