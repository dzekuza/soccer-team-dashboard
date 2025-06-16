import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { supabaseService } from "@/lib/supabase-service"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

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
  // Extract JWT from Authorization header
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.split(" ")[1]
  // Create a Supabase client with the user's JWT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  // Check user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to create an event." }, { status: 401 })
  }

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

    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
      // Create event with pricing tiers and teams
      const event = await dbService.createEvent({ title, description, date, time, location, team1Id, team2Id }, pricingTiers, supabase)
      console.log("API: Event created successfully:", event)

      // === NEW: Notify all subscribers ===
      // Fetch all subscribers
      const subscribers = await supabaseService.getAllSubscriberEmails(); // [{ email, name }]
      // Fetch team info
      let team1Name = 'Komanda 1';
      let team2Name = 'Komanda 2';
      let team1Logo = '';
      let team2Logo = '';
      if (event.team1Id) {
        const team1 = await supabaseService.getTeamById(event.team1Id);
        if (team1) {
          team1Name = team1.team_name;
          team1Logo = team1.logo || '';
        }
      }
      if (event.team2Id) {
        const team2 = await supabaseService.getTeamById(event.team2Id);
        if (team2) {
          team2Name = team2.team_name;
          team2Logo = team2.logo || '';
        }
      }
      const bangaLogoUrl = 'https://ebdfqztiximsqdnvwkqu.supabase.co/storage/v1/object/public/logo//%20Banga.png';
      const eventUrl = `https://soccer-team-dashboard.vercel.app/event/${event.id}`;
      const emailHtml = `
  <div style="font-family: Inter, sans-serif; color: #ffffff; background-color: #0A165B; padding: 24px;">
    <img src="${bangaLogoUrl}" alt="FK Banga Logo" width="120" style="margin-bottom: 24px;" />
    <h2 style="font-size: 20px; font-weight: 500;">Paskelbtas naujas renginys</h2>
    <hr style="border: 0; border-top: 1px solid #2D3B80; margin: 16px 0;" />
    <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 16px;">
      <div style="text-align: center;">
        <img src="${team1Logo}" alt="Team 1" width="48" /><br />
        <span style="color: #ffffff;">${team1Name}</span>
      </div>
      <strong style="color: #ffffff;">prieš</strong>
      <div style="text-align: center;">
        <img src="${team2Logo}" alt="Team 2" width="48" /><br />
        <span style="color: #ffffff;">${team2Name}</span>
      </div>
    </div>
    <h3 style="color: #F15601; margin-top: 0;">Rungtynių pradžia: ${event.time || 'XX:XX'}</h3>
    <p style="color: #8B9ED1;">${event.date || ''}</p>
    <table style="width: 100%; margin-top: 16px; color: #ffffff;">
      <tr>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">LOKACIJA</th>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">BILIETO TIPAS</th>
      </tr>
      <tr>
        <td style="font-size: 14px;">${event.location || ''}</td>
        <td style="font-size: 14px;">${event.pricingTiers?.[0]?.name || 'VIP'}</td>
      </tr>
    </table>
    <div style="text-align: center; margin-top: 32px;">
      <a href="${eventUrl}" style="display: inline-block; background: #F15601; color: #fff; padding: 12px 32px; border-radius: 4px; font-size: 16px; text-decoration: none; font-weight: 600;">Peržiūrėti renginį</a>
    </div>
  </div>
`;
      // Send to all subscribers
      for (const sub of subscribers) {
        await resend.emails.send({
          from: "Banga <info@teamup.lt>",
          to: sub.email,
          subject: "Paskelbtas naujas renginys",
          html: emailHtml,
        })
      }
      // === END NEW ===
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
