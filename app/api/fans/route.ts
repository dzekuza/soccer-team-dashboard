import { createRouteHandlerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"
import type { Fan } from '@/lib/types'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() })
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('purchaser_name, purchaser_surname, purchaser_email, pricing_tiers(price)');
      
    if (ticketsError) throw ticketsError;

    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('purchaser_name, purchaser_surname, purchaser_email, valid_to');

    if (subsError) throw subsError;

    const fansMap = new Map<string, Fan>();

    // Process tickets
    for (const ticket of tickets) {
        if (!ticket.purchaser_email) continue;

        let fan = fansMap.get(ticket.purchaser_email);
        if (!fan) {
            fan = {
                name: `${ticket.purchaser_name || ''} ${ticket.purchaser_surname || ''}`.trim(),
                email: ticket.purchaser_email,
                totalTickets: 0,
                moneySpent: 0,
                hasValidSubscription: false
            };
        }

        fan.totalTickets += 1;
        fan.moneySpent += ticket.pricing_tiers?.price || 0;
        fansMap.set(ticket.purchaser_email, fan);
    }
    
    // Process subscriptions
    const now = new Date();
    for (const sub of subscriptions) {
        if (!sub.purchaser_email) continue;
    
        let fan = fansMap.get(sub.purchaser_email);
        if (!fan) {
            fan = {
                name: `${sub.purchaser_name || ''} ${sub.purchaser_surname || ''}`.trim(),
                email: sub.purchaser_email,
                totalTickets: 0,
                moneySpent: 0,
                hasValidSubscription: false
            };
        }
        
        const validTo = new Date(sub.valid_to);
        if (validTo > now) {
            fan.hasValidSubscription = true;
        }

        fansMap.set(sub.purchaser_email, fan);
    }

    return NextResponse.json(Array.from(fansMap.values()));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: "Failed to fetch fan data", details: errorMessage }, { status: 500 })
  }
} 