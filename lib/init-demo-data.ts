import { mockDb } from "./mock-database"
import { redis } from "./redis"

export async function initializeDemoData() {
  try {
    // Initialize mock database
    mockDb.init()

    // Initialize Redis counters
    await redis.set("tickets:created:total", 5)
    await redis.set("tickets:validated:total", 2)

    console.log("Demo data initialized successfully!")
  } catch (error) {
    console.error("Error initializing demo data:", error)
  }
}
