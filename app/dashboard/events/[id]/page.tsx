import { supabaseService } from "@/lib/supabase-service";
import EventDetailClient from "./event-detail-client";
import { connection } from 'next/server';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EventDetailPage(props: PageProps) {
    const params = await props.params;
    await connection();
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
                    <h1 className="text-title font-bold">Error</h1>
                    <p className="text-red-500">Failed to load event data. Please try again later.</p>
                </div>
            </div>
        );
    }
} 