import { NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { createClient } from '@supabase/supabase-js'

// Create a service role client for admin access
const serviceSupabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    console.log("Creating test teams...")
    // Create two test teams
    const { data: team1, error: team1Error } = await serviceSupabase
      .from('teams')
      .insert([{
        team_name: "Test Team 1",
        logo: "https://example.com/logo1.png"
      }])
      .select()
      .single()

    if (team1Error) {
      console.error("Error creating team 1:", team1Error)
      return NextResponse.json({ 
        error: "Failed to create team 1", 
        details: team1Error.message 
      }, { status: 500 })
    }

    console.log("Team 1 created:", team1)

    const { data: team2, error: team2Error } = await serviceSupabase
      .from('teams')
      .insert([{
        team_name: "Test Team 2",
        logo: "https://example.com/logo2.png"
      }])
      .select()
      .single()

    if (team2Error) {
      console.error("Error creating team 2:", team2Error)
      return NextResponse.json({ 
        error: "Failed to create team 2", 
        details: team2Error.message 
      }, { status: 500 })
    }

    console.log("Team 2 created:", team2)

    const testEvent = {
      title: "Test Event",
      description: "Test event description",
      date: "2024-05-01",
      time: "19:00",
      location: "Test Stadium",
      team1_id: team1.id,
      team2_id: team2.id
    }

    console.log("Creating event with data:", testEvent)

    const testPricingTiers = [
      {
        name: "Standard",
        price: 20,
        maxQuantity: 100
      },
      {
        name: "VIP",
        price: 50,
        maxQuantity: 20
      }
    ]

    console.log("With pricing tiers:", testPricingTiers)

    // Try to create event directly with Supabase client first
    const { data: eventData, error: eventError } = await serviceSupabase
      .from('events')
      .insert([testEvent])
      .select()
      .single()

    if (eventError) {
      console.error("Error creating event directly:", eventError)
      return NextResponse.json({ 
        error: "Failed to create event directly", 
        details: eventError.message 
      }, { status: 500 })
    }

    console.log("Event created directly:", eventData)

    // Now try to create pricing tiers
    const tiersToCreate = testPricingTiers.map(tier => ({
      event_id: eventData.id,
      name: tier.name,
      price: tier.price,
      quantity: tier.maxQuantity
    }))

    const { data: tiersData, error: tiersError } = await serviceSupabase
      .from('pricing_tiers')
      .insert(tiersToCreate)
      .select()

    if (tiersError) {
      console.error("Error creating pricing tiers:", tiersError)
      // Delete the event since pricing tiers failed
      await serviceSupabase.from('events').delete().eq('id', eventData.id)
      return NextResponse.json({ 
        error: "Failed to create pricing tiers", 
        details: tiersError.message 
      }, { status: 500 })
    }

    console.log("Pricing tiers created:", tiersData)

    const result = {
      ...eventData,
      pricing_tiers: tiersData
    }

    console.log("Final result:", result)
    return NextResponse.json({ success: true, event: result })
  } catch (error) {
    console.error("Error in test route:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 