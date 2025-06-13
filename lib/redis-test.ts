import { redis } from "./redis"

export async function testRedisConnection() {
  try {
    // Test basic operations
    await redis.set("test:connection", "success")
    const result = await redis.get("test:connection")
    await redis.del("test:connection")

    return {
      connected: result === "success",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Redis connection test failed:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}
