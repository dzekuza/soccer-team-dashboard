import { supabaseService } from "@/lib/supabase-service"
import OverviewClient from "./overview-client"
import { RecentActivity, Event, TicketWithDetails } from "@/lib/types"

export const revalidate = 0; // Revalidate data on every request

export default async function DashboardOverviewPage() {
  const [statsData, eventsData, ticketsData] = await Promise.all([
    supabaseService.getEventStats(),
    supabaseService.getEvents(),
    supabaseService.getTickets(), 
  ]);

  const detailedTickets = await Promise.all(
    ticketsData.slice(0, 5).map(t => supabaseService.getTicketWithDetails(t.id))
  );
  const validDetailedTickets = detailedTickets.filter((t): t is TicketWithDetails => t !== null);

  const activity: RecentActivity[] = [
    ...eventsData.slice(0, 2).map((event: Event) => ({
      type: "event_created" as const,
      title: `Event Created: ${event.title}`,
      timestamp: event.createdAt,
      details: `${event.date} at ${event.time}`,
    })),
    ...validDetailedTickets.slice(0, 3).map((ticket: TicketWithDetails) => ({
      type: ticket.isValidated ? ("ticket_validated" as const) : ("ticket_generated" as const),
      title: ticket.isValidated ? `Ticket Validated` : `Ticket Generated`,
      timestamp: ticket.validatedAt || ticket.createdAt,
      details: `${ticket.event.title} - ${ticket.purchaserName}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <OverviewClient
      initialStats={statsData}
      initialRecentTickets={validDetailedTickets}
      initialRecentActivity={activity.slice(0, 5)}
    />
  )
}
