import { supabaseService } from "@/lib/supabase-service";
import ExportClient from "./export-client";
import { unstable_noStore as noStore } from 'next/cache';

export default async function ExportPage() {
    noStore();
    try {
        const eventsData = supabaseService.getEvents();
        const ticketsData = supabaseService.getTicketsWithDetails();
        const statsData = supabaseService.getEventStats();

        const [events, ticketsResult, stats] = await Promise.all([
            eventsData,
            ticketsData,
            statsData,
        ]);

        const tickets = ticketsResult.data || [];

        return <ExportClient initialEvents={events} initialTickets={tickets} initialStats={stats} />;
    } catch (error) {
        console.error(error);
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Error</h1>
                    <p className="text-red-500">Failed to load export data. Please try again later.</p>
                </div>
            </div>
        );
    }
}
