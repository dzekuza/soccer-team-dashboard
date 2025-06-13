import { NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function GET() {
  try {
    const stats = await dbService.getEventStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
