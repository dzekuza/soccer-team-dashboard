import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    const [totalCreated, totalValidated] = await Promise.all([
      redis.get("tickets:created:total") || 0,
      redis.get("tickets:validated:total") || 0,
    ])

    return NextResponse.json({
      totalTicketsCreated: Number(totalCreated),
      totalTicketsValidated: Number(totalValidated),
    })
  } catch (error) {
    console.error("Error fetching Redis analytics:", error)
    return NextResponse.json({
      totalTicketsCreated: 0,
      totalTicketsValidated: 0,
    })
  }
}
