import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function DELETE() {
  try {
    // Clear common cache patterns
    const keys = await redis.keys("*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return NextResponse.json({ message: "Cache cleared successfully" })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Upstash Redis does not support the INFO command directly. We'll return a basic ping and key count as a placeholder.
    const ping = await redis.ping();
    const keyCount = (await redis.keys("*")).length;

    const cacheStats = {
      redisInfo: {
        ping,
        keyCount,
        // info: 'Not supported on Upstash Redis',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(cacheStats);
  } catch (error) {
    console.error("Error fetching cache info:", error);
    return NextResponse.json({ error: "Failed to fetch cache info" }, { status: 500 });
  }
}
