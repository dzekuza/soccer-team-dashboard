import { supabaseService } from "@/lib/supabase-service";
import { TicketsClient } from "./tickets-client";
import { connection } from 'next/server';

export default async function TicketsPage() {
  await connection();
  const { data: tickets, error } = await supabaseService.getTicketsWithDetails();

  if (error) {
    console.error("Failed to fetch tickets:", error);
    // Optionally render an error state to the user
    return <div>Error loading tickets. Please try again later.</div>;
  }

  return <TicketsClient initialTickets={tickets || []} />;
}
