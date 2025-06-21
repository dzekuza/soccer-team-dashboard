import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server"
import type { Fan, PricingTier } from '@/lib/types'
import { supabaseService } from "@/lib/supabase-service";

export async function GET() {
  const supabase = createClient();
  try {
    const [tickets, subscriptions] = await Promise.all([
      supabaseService.getTicketsWithDetails(),
      supabaseService.getSubscriptions(),
    ]);

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
        
        const tiers: PricingTier | PricingTier[] = ticket.pricing_tiers;
        if (Array.isArray(tiers)) {
          fan.moneySpent += tiers.reduce((acc, tier) => acc + (tier?.price || 0), 0)
        } else if (tiers) {
          fan.moneySpent += tiers.price || 0
        }
        
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