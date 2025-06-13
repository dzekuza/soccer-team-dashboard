import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Aggregate fans from tickets table
  // Group by purchaser_email, purchaser_name, count unique event_ids, sum ticket prices
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("purchaser_name, purchaser_email, event_id, tier_id")
    .neq("purchaser_email", null)
    .neq("purchaser_email", "")
    .neq("purchaser_name", null)
    .neq("purchaser_name", "");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Fetch all pricing tiers for price lookup
  const { data: tiers, error: tierError } = await supabase
    .from("pricing_tiers")
    .select("id, price");
  if (tierError) {
    return NextResponse.json({ error: tierError.message }, { status: 500 });
  }
  const tierPriceMap = Object.fromEntries((tiers || []).map(t => [t.id, t.price]));
  // Aggregate by email
  const fanMap = new Map();
  for (const t of tickets || []) {
    if (!t.purchaser_email) continue;
    const key = t.purchaser_email;
    if (!fanMap.has(key)) {
      fanMap.set(key, {
        id: key,
        name: t.purchaser_name,
        email: t.purchaser_email,
        events: new Set(),
        moneySpent: 0,
      });
    }
    const fan = fanMap.get(key);
    fan.events.add(t.event_id);
    fan.moneySpent += Number(tierPriceMap[t.tier_id] || 0);
  }
  const fans = Array.from(fanMap.values()).map(fan => ({
    id: fan.id,
    name: fan.name,
    email: fan.email,
    eventsAttended: fan.events.size,
    moneySpent: fan.moneySpent,
  }));
  return NextResponse.json(fans);
} 