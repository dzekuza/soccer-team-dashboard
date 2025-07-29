import { supabaseService } from "@/lib/supabase-service";
import EventsClient from "./events-client";
import { unstable_noStore as noStore } from 'next/cache';

export default async function EventsPage() {
  noStore();
  try {
    const eventsData = supabaseService.getEventsWithTiers();
    const teamsData = supabaseService.getTeams();
    const ticketsData = supabaseService.getTicketsWithDetails();

    const [events, teams, ticketsResult] = await Promise.all([
      eventsData,
      teamsData,
      ticketsData,
    ]);

    const tickets = ticketsResult.data || [];

    return <EventsClient initialEvents={events} initialTickets={tickets} initialTeams={teams} />;
  } catch (error) {
    console.error(error);
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-red-500">Failed to load events data. Please try again later.</p>
            </div>
        </div>
    );
  }
}
