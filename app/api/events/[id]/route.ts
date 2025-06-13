import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"
import { supabase } from "@/lib/supabase"
import { testSupabaseConnection } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await dbService.getEventWithTiers(params.id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure connection
    await testSupabaseConnection();
    // Attempt to delete the event
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if ((data as any)?.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
