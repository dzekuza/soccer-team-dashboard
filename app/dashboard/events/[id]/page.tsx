import { supabaseService } from "@/lib/supabase-service";
import EventDetailClient from "./event-detail-client";
import { unstable_noStore as noStore } from 'next/cache';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function EventDetailPage({ params }: PageProps) {
    noStore();
    const { id } = params;

    try {
        const eventData = supabaseService.getEventWithTiers(id);
        const teamsData = supabaseService.getTeams();

        const [event, teams] = await Promise.all([
            eventData,
            teamsData
        ]);

        return <EventDetailClient event={event} teams={teams} />;
    } catch (error) {
        console.error(error);
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Error</h1>
                    <p className="text-red-500">Failed to load event data. Please try again later.</p>
                </div>
            </div>
        );
    }
} 