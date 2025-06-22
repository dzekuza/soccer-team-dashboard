import { supabaseService } from "@/lib/supabase-service";
import { TicketsClient } from "./tickets-client";
import { unstable_noStore as noStore } from 'next/cache';

export default async function TicketsPage() {
  noStore();
  const { data: tickets, error } = await supabaseService.getTicketsWithDetails();

  if (error) {
    console.error("Failed to fetch tickets:", error);
    // Optionally render an error state to the user
    return <div>Error loading tickets. Please try again later.</div>;
  }

  return <TicketsClient initialTickets={tickets || []} />;
}
