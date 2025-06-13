import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Test basic operations
    await redis.set("test:connection", "success")
    const result = await redis.get("test:connection")
    await redis.del("test:connection")

    return NextResponse.json({
      connected: result === "success",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Redis connection test failed:", error)
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
}
