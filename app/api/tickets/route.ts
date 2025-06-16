import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { Resend } from "resend"
import { generateTicketPDF } from "@/lib/pdf-generator"
import { createClient } from '@supabase/supabase-js'
import type { Team } from "@/lib/types"

const resend = new Resend(process.env.RESEND_API_KEY)

// Service role client for privileged actions
const serviceSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Extract JWT from Authorization header
    const authHeader = request.headers.get('authorization')
    const jwt = authHeader?.split(' ')[1]
    console.log('[DEBUG] JWT received:', jwt)
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

    const body = await request.json()
    const { eventId, tierId, purchaserName, purchaserEmail } = body

    // Validate required fields
    if (!eventId || !tierId || !purchaserName || !purchaserEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the pricing tier exists and has available capacity
    const tier = await dbService.getPricingTier(tierId)
    if (!tier) {
      return NextResponse.json({ error: "Pricing tier not found" }, { status: 404 })
    }

    if (tier.soldQuantity >= tier.maxQuantity) {
      return NextResponse.json({ error: "No tickets available for this tier" }, { status: 400 })
    }

    // 1. Check if user exists, or create
    let userId: string | undefined = undefined;
    const { data: user, error: userError } = await serviceSupabase
      .from("users")
      .select("id")
      .eq("email", purchaserEmail)
      .single();
    if (!user || userError) {
      const { data: newUser, error: createUserError } = await serviceSupabase
        .from("users")
        .insert({ email: purchaserEmail, name: purchaserName })
        .select("id")
        .single();
      if (createUserError) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }
      userId = newUser.id;
    } else {
      userId = user.id;
    }

    // Fetch event to get cover image URL
    const event = await dbService.getEventWithTiers(eventId)
    let eventCoverImageUrl = null
    if (event && event.coverImageUrl) {
      // If the coverImageUrl is a path (e.g., 'covers/filename.jpg'), construct the public URL
      if (event.coverImageUrl.startsWith('http')) {
        eventCoverImageUrl = event.coverImageUrl
      } else {
        // Assume it's a path in the covers bucket
        const coversBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/covers/'
        eventCoverImageUrl = coversBaseUrl + event.coverImageUrl.replace(/^covers\//, '')
      }
    }

    // 2. Create ticket, assign to user
    const ticket = await dbService.createTicket({
      eventId,
      tierId,
      purchaserName,
      purchaserEmail,
      userId,
      eventCoverImageUrl,
    }, supabase)

    // 3. Increment sold_quantity in pricing_tiers
    await supabase
      .from("pricing_tiers")
      .update({ sold_quantity: tier.soldQuantity + 1 })
      .eq("id", tierId)

    // Send email with PDF ticket
    if (ticket && purchaserEmail) {
      try {
        if (!event || !tier) {
          console.warn("Cannot send ticket email: event or tier not found.")
        } else {
          // Fetch real team data
          let team1: Team | undefined = undefined;
          let team2: Team | undefined = undefined;
          if (event.team1Id) {
            const t1 = await dbService.getTeamById(event.team1Id);
            if (t1) team1 = t1;
          }
          if (event.team2Id) {
            const t2 = await dbService.getTeamById(event.team2Id);
            if (t2) team2 = t2;
          }
          const pdfBytes = await generateTicketPDF({
            ...ticket,
            event,
            tier,
          }, team1, team2)
          // Prepare dynamic team and event info
          let team1Name = 'Komanda 1';
          let team2Name = 'Komanda 2';
          let team1Logo = 'https://yourdomain.com/team1.png';
          let team2Logo = 'https://yourdomain.com/team2.png';
          if (team1) {
            team1Name = team1.team_name;
            team1Logo = team1.logo || team1Logo;
          }
          if (team2) {
            team2Name = team2.team_name;
            team2Logo = team2.logo || team2Logo;
          }
          function formatCurrency(amount: number) {
            return new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(amount);
          }
          const bangaLogoUrl = 'https://ebdfqztiximsqdnvwkqu.supabase.co/storage/v1/object/public/logo//%20Banga.png';
          const emailHtml = `
  <div style="font-family: Inter, sans-serif; color: #ffffff; background-color: #0A165B; padding: 24px;">
    <img src="${bangaLogoUrl}" alt="FK Banga Logo" width="120" style="margin-bottom: 24px;" />
    
    <h2 style="font-size: 20px; font-weight: 500;">Jūsų bilietas į renginį</h2>
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

    <h3 style="color: #F15601; margin-top: 0;">RUNGtynių PRADŽIA: ${event.time || 'XX:XX'}</h3>
    <p style="color: #8B9ED1;">${event.date || 'Sekmadienis, Rug. 24, 2025'}</p>

    <table style="width: 100%; margin-top: 16px; color: #ffffff;">
      <tr>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">LOKACIJA</th>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">BILIETO TIPAS</th>
        <th style="text-align: left; font-size: 10px; color: #8B9ED1;">KAINA</th>
      </tr>
      <tr>
        <td style="font-size: 14px;">${event.location || 'Svencele Stadium'}</td>
        <td style="font-size: 14px;">${tier.name || 'VIP'}</td>
        <td style="font-size: 14px;">${formatCurrency(tier.price || 0)}</td>
      </tr>
    </table>

    <div style="background: #0F1B47; padding: 16px; margin-top: 24px;">
      <table style="width: 100%; color: #ffffff;">
        <tr>
          <th style="text-align: left; font-size: 10px; color: #8B9ED1;">PIRKĖJO VARDAS</th>
          <th style="text-align: left; font-size: 10px; color: #8B9ED1;">EL. PAŠTAS</th>
        </tr>
        <tr>
          <td style="font-size: 14px;">${purchaserName || 'Vardas'}</td>
          <td style="font-size: 14px;">${purchaserEmail}</td>
        </tr>
      </table>
    </div>

    <p style="margin-top: 32px; color: #8B9ED1;">Bilietas pridedamas kaip PDF dokumentas.</p>
  </div>
`
          const result = await resend.emails.send({
            from: "Banga <info@teamup.lt>",
            to: purchaserEmail,
            subject: "Jūsų bilietas į renginį",
            html: emailHtml,
            attachments: [{ filename: `ticket-${ticket.id}.pdf`, content: Buffer.from(pdfBytes) }],
          })
          console.log("[Resend] Email send result:", result)
        }
      } catch (err) {
        console.error("Failed to send manual ticket email:", err)
      }
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const tickets = await dbService.getTicketsWithDetails()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
