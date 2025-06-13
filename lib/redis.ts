import { Redis } from "@upstash/redis"

// Initialize Redis client with your credentials
export const redis = new Redis({
  url: "https://close-rattler-31491.upstash.io",
  token: "AXsDAAIjcDEyZmVlMmZjMzVkMGU0YjZhODJkNTU2Y2FkMDE1NDJkOXAxMA",
})

// Cache keys
export const CACHE_KEYS = {
  EVENTS: "events:all",
  EVENT: (id: string) => `event:${id}`,
  EVENT_WITH_TIERS: (id: string) => `event:${id}:tiers`,
  PRICING_TIERS: (eventId: string) => `pricing_tiers:${eventId}`,
  TICKETS: "tickets:all",
  TICKET: (id: string) => `ticket:${id}`,
  TICKET_WITH_DETAILS: (id: string) => `ticket:${id}:details`,
  STATS: "stats:dashboard",
} as const

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
} as const

// Helper functions for cache operations
export const cacheHelpers = {
  // Set data with TTL
  setWithTTL: async (key: string, data: any, ttl: number = CACHE_TTL.MEDIUM) => {
    try {
      await redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error("Redis set error:", error)
    }
  },

  // Get data from cache
  get: async (key: string): Promise<any | null> => {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data as string) : null
    } catch (error) {
      console.error("Redis get error:", error)
      return null
    }
  },

  // Delete cache key
  del: async (key: string) => {
    try {
      await redis.del(key)
    } catch (error) {
      console.error("Redis delete error:", error)
    }
  },

  // Increment counter
  incr: async (key: string) => {
    try {
      return await redis.incr(key)
    } catch (error) {
      console.error("Redis increment error:", error)
      return 0
    }
  },
}
