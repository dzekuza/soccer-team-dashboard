// Import the types we need
import type { Event, PricingTier, Ticket } from "./types"

// Storage keys
const STORAGE_KEYS = {
  EVENTS: "soccer_dashboard_events",
  PRICING_TIERS: "soccer_dashboard_pricing_tiers",
  TICKETS: "soccer_dashboard_tickets",
  USERS: "soccer_dashboard_users",
  CURRENT_USER: "soccer_dashboard_current_user",
}

// User type
export interface User {
  id: string
  email: string
  name: string
  password: string // In a real app, this would be hashed
  role: "admin" | "staff"
  createdAt: string
}

// In-memory store for server-side rendering
const memoryStore: Record<string, any> = {
  [STORAGE_KEYS.EVENTS]: [],
  [STORAGE_KEYS.PRICING_TIERS]: [],
  [STORAGE_KEYS.TICKETS]: [],
  [STORAGE_KEYS.USERS]: [],
  [STORAGE_KEYS.CURRENT_USER]: null,
}

// Helper to safely parse JSON from localStorage or use memory store
function safelyParseJSON(key: string, defaultValue: any): any {
  // If we're on the server, use the memory store
  if (typeof window === "undefined") {
    return memoryStore[key] || defaultValue
  }

  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Update memory store with localStorage data
      memoryStore[key] = parsed
      return parsed
    }
    return defaultValue
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Helper to safely store JSON in localStorage or memory store
function safelyStoreJSON(key: string, value: any): void {
  // Always update the memory store
  memoryStore[key] = value

  // If we're on the client, also update localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error storing ${key} in localStorage:`, error)
    }
  }
}

class StorageService {
  // Events
  getEvents(): Event[] {
    const events = safelyParseJSON(STORAGE_KEYS.EVENTS, [])
    console.log("Storage: Retrieved events:", events)
    return events
  }

  setEvents(events: Event[]): void {
    console.log("Storage: Setting events:", events)
    safelyStoreJSON(STORAGE_KEYS.EVENTS, events)
  }

  addEvent(event: Event): void {
    console.log("Storage: Adding event:", event)
    const events = this.getEvents()
    events.push(event)
    this.setEvents(events)
  }

  updateEvent(updatedEvent: Event): void {
    const events = this.getEvents()
    const index = events.findIndex((e) => e.id === updatedEvent.id)
    if (index !== -1) {
      events[index] = updatedEvent
      this.setEvents(events)
    }
  }

  deleteEvent(id: string): void {
    const events = this.getEvents()
    this.setEvents(events.filter((e) => e.id !== id))

    // Also delete related pricing tiers and tickets
    const pricingTiers = this.getPricingTiers()
    this.setPricingTiers(pricingTiers.filter((pt) => pt.eventId !== id))

    const tickets = this.getTickets()
    this.setTickets(tickets.filter((t) => t.eventId !== id))
  }

  // Pricing Tiers
  getPricingTiers(): PricingTier[] {
    return safelyParseJSON(STORAGE_KEYS.PRICING_TIERS, [])
  }

  setPricingTiers(pricingTiers: PricingTier[]): void {
    console.log("Storage: Setting pricing tiers:", pricingTiers)
    safelyStoreJSON(STORAGE_KEYS.PRICING_TIERS, pricingTiers)
  }

  addPricingTier(pricingTier: PricingTier): void {
    console.log("Storage: Adding pricing tier:", pricingTier)
    const pricingTiers = this.getPricingTiers()
    pricingTiers.push(pricingTier)
    this.setPricingTiers(pricingTiers)
  }

  updatePricingTier(updatedPricingTier: PricingTier): void {
    const pricingTiers = this.getPricingTiers()
    const index = pricingTiers.findIndex((pt) => pt.id === updatedPricingTier.id)
    if (index !== -1) {
      pricingTiers[index] = updatedPricingTier
      this.setPricingTiers(pricingTiers)
    }
  }

  deletePricingTier(id: string): void {
    const pricingTiers = this.getPricingTiers()
    this.setPricingTiers(pricingTiers.filter((pt) => pt.id !== id))

    // Also delete related tickets
    const tickets = this.getTickets()
    this.setTickets(tickets.filter((t) => t.tierId !== id))
  }

  // Tickets
  getTickets(): Ticket[] {
    return safelyParseJSON(STORAGE_KEYS.TICKETS, [])
  }

  setTickets(tickets: Ticket[]): void {
    safelyStoreJSON(STORAGE_KEYS.TICKETS, tickets)
  }

  addTicket(ticket: Ticket): void {
    const tickets = this.getTickets()
    tickets.push(ticket)
    this.setTickets(tickets)

    // Update sold quantity for the pricing tier
    const pricingTiers = this.getPricingTiers()
    const tierIndex = pricingTiers.findIndex((pt) => pt.id === ticket.tierId)
    if (tierIndex !== -1) {
      pricingTiers[tierIndex].soldQuantity += 1
      this.setPricingTiers(pricingTiers)
    }
  }

  updateTicket(updatedTicket: Ticket): void {
    const tickets = this.getTickets()
    const index = tickets.findIndex((t) => t.id === updatedTicket.id)
    if (index !== -1) {
      tickets[index] = updatedTicket
      this.setTickets(tickets)
    }
  }

  deleteTicket(id: string): void {
    const tickets = this.getTickets()
    const ticket = tickets.find((t) => t.id === id)

    if (ticket) {
      // Update sold quantity for the pricing tier
      const pricingTiers = this.getPricingTiers()
      const tierIndex = pricingTiers.findIndex((pt) => pt.id === ticket.tierId)
      if (tierIndex !== -1) {
        if (pricingTiers[tierIndex].soldQuantity > 0) {
          pricingTiers[tierIndex].soldQuantity -= 1
        }
        this.setPricingTiers(pricingTiers)
      }

      this.setTickets(tickets.filter((t) => t.id !== id))
    }
  }

  // Users
  getUsers(): User[] {
    return safelyParseJSON(STORAGE_KEYS.USERS, [])
  }

  setUsers(users: User[]): void {
    safelyStoreJSON(STORAGE_KEYS.USERS, users)
  }

  addUser(user: User): void {
    console.log("Adding new user:", user)
    const users = this.getUsers()
    users.push(user)
    this.setUsers(users)
    console.log("Updated users list:", users)
  }

  getUserByEmail(email: string): User | undefined {
    const users = this.getUsers()
    const user = users.find((u) => u.email === email)
    console.log(`Looking up user by email ${email}:`, user || "Not found")
    return user
  }

  getCurrentUser(): User | null {
    const user = safelyParseJSON(STORAGE_KEYS.CURRENT_USER, null)
    console.log("Getting current user:", user)
    return user
  }

  setCurrentUser(user: User | null): void {
    console.log("Setting current user:", user)
    safelyStoreJSON(STORAGE_KEYS.CURRENT_USER, user)
  }

  // Initialize with default admin user if none exists
  initializeUsers(): void {
    const users = this.getUsers()
    console.log("Initializing users. Current users:", users)
    if (users.length === 0) {
      const adminUser = {
        id: `user_${Date.now()}`,
        email: "admin@example.com",
        name: "Admin User",
        password: "password123", // In a real app, this would be hashed
        role: "admin" as const,
        createdAt: new Date().toISOString(),
      }
      console.log("No users found. Adding default admin:", adminUser)
      this.addUser(adminUser)
    }
  }

  // Clear all data (for testing)
  clearAll(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.EVENTS)
      localStorage.removeItem(STORAGE_KEYS.PRICING_TIERS)
      localStorage.removeItem(STORAGE_KEYS.TICKETS)
      // Don't clear users or current user
    }

    // Clear memory store
    memoryStore[STORAGE_KEYS.EVENTS] = []
    memoryStore[STORAGE_KEYS.PRICING_TIERS] = []
    memoryStore[STORAGE_KEYS.TICKETS] = []
  }
}

// Export a singleton instance
const Storage = new StorageService()
export default Storage
