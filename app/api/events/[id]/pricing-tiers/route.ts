import { type NextRequest, NextResponse } from "next/server"
import { dbService } from "@/lib/db-service"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { params } = await context;
  try {
    const pricingTiers = await dbService.getPricingTiers(params.id)
    return NextResponse.json(pricingTiers)
  } catch (error) {
    console.error("Error fetching pricing tiers:", error)
    return NextResponse.json({ error: "Failed to fetch pricing tiers" }, { status: 500 })
  }
}
