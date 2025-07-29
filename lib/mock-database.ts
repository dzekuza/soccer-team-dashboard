import type { Event, PricingTier, Ticket, EventWithTiers, TicketWithDetails } from "./types"
import Storage from "./storage"

// Initialize with demo data
const initializeMockData = () => {
  // Check if we already have events
  const existingEvents = Storage.getEvents()
  if (existingEvents.length > 0) return // Already initialized

  console.log("Initializing mock data...")

  // Create demo events
  const demoEvents: Omit<Event, "id">[] = [
    {
      title: "Championship Final 2024",
      description: "The ultimate showdown! Our team faces the defending champions in this season's final match.",
      date: "2024-07-15",
      time: "19:00",
      location: "Main Stadium - Downtown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Season Opener vs Rivals",
      description: "Kick off the new season with our biggest rivalry match!",
      date: "2024-08-01",
      time: "18:30",
      location: "Community Field - Westside",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Youth Development Showcase",
      description: "Watch our youth teams in action! A special event showcasing the future stars.",
      date: "2024-08-15",
      time: "15:00",
      location: "Training Ground - North Campus",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Create events with IDs
  const events = demoEvents.map((event, index) => ({
    ...event,
    id: `event_${index + 1}`,
  }))

  // Add events to storage
  events.forEach((event) => Storage.addEvent(event))

  // Create pricing tiers
  const demoPricingTiers = [
    // Championship Match tiers
    { eventId: "event_1", name: "VIP Seating", price: 50.0, quantity: 100, soldQuantity: 45 },
    { eventId: "event_1", name: "Premium Seating", price: 35.0, quantity: 200, soldQuantity: 78 },
    { eventId: "event_1", name: "General Admission", price: 25.0, quantity: 500, soldQuantity: 234 },

    // League Match tiers
    { eventId: "event_2", name: "General Admission", price: 20.0, quantity: 250, soldQuantity: 67 },
    { eventId: "event_2", name: "Student Discount", price: 15.0, quantity: 100, soldQuantity: 23 },
    { eventId: "event_2", name: "VIP Seating", price: 45.0, quantity: 75, soldQuantity: 8 },

    // Youth Showcase tiers
    { eventId: "event_3", name: "General Admission", price: 10.0, quantity: 200, soldQuantity: 34 },
    { eventId: "event_3", name: "Family Package", price: 30.0, quantity: 60, soldQuantity: 15 },
  ]

  const pricingTiers = demoPricingTiers.map((tier, index) => ({
    ...tier,
    id: `tier_${index + 1}`,
  }))

  // Add pricing tiers to storage
  pricingTiers.forEach((tier) => Storage.addPricingTier(tier))

  // Create demo tickets
  const demoTickets = [
    {
      eventId: "event_1",
      tierId: "tier_1",
      purchaserName: "John Smith",
      purchaserEmail: "john.smith@email.com",
      isValidated: true,
      validatedAt: new Date().toISOString(),
    },
    {
      eventId: "event_1",
      tierId: "tier_2",
      purchaserName: "Sarah Johnson",
      purchaserEmail: "sarah.j@email.com",
      isValidated: false,
      validatedAt: null,
    },
    {
      eventId: "event_2",
      tierId: "tier_4",
      purchaserName: "Mike Wilson",
      purchaserEmail: "mike.wilson@email.com",
      isValidated: true,
      validatedAt: new Date().toISOString(),
    },
    {
      eventId: "event_2",
      tierId: "tier_5",
      purchaserName: "Alex Thompson",
      purchaserEmail: "alex.t@student.edu",
      isValidated: false,
      validatedAt: null,
    },
    {
      eventId: "event_3",
      tierId: "tier_7",
      purchaserName: "Maria Rodriguez",
      purchaserEmail: "maria.r@email.com",
      isValidated: false,
      validatedAt: null,
    },
  ]

  const tickets = demoTickets.map((ticket, index) => ({
    ...ticket,
    id: `ticket_${index + 1}`,
    createdAt: new Date().toISOString(),
    qrCodeUrl: `https://example.com/validate-ticket/ticket_${index + 1}`,
  }))

  // Add tickets to storage
  tickets.forEach((ticket) => Storage.addTicket(ticket))

  console.log("Mock data initialization complete")
}

export const mockDb = {
  // Initialize data
  init: () => {
    initializeMockData()
  },

  // Events
  createEvent: async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
    pricingTiersData: Omit<PricingTier, "id" | "eventId" | "soldQuantity">[],
  ): Promise<EventWithTiers> => {
    const eventId = `event_${Date.now()}`
    const event: Event = {
      ...eventData,
      id: eventId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    Storage.addEvent(event)

    const newTiers = pricingTiersData.map((tier, index) => {
      const newTier: PricingTier = {
        ...tier,
        id: `tier_${Date.now()}_${index}`,
        eventId,
        soldQuantity: 0,
      }
      Storage.addPricingTier(newTier)
      return newTier
    })

    return { ...event, pricingTiers: newTiers }
  },

  getEvents: async (): Promise<Event[]> => {
    initializeMockData()
    return Storage.getEvents().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getEventsWithTiers: async (): Promise<EventWithTiers[]> => {
    initializeMockData()
    const events = Storage.getEvents()
    const pricingTiers = Storage.getPricingTiers()

    return events.map((event) => ({
      ...event,
      pricingTiers: pricingTiers.filter((tier) => tier.eventId === event.id),
    }))
  },

  getEvent: async (id: string): Promise<Event | null> => {
    initializeMockData()
    const event = Storage.getEvents().find((event) => event.id === id)
    return event || null
  },

  getEventWithTiers: async (id: string): Promise<EventWithTiers | null> => {
    initializeMockData()
    const event = Storage.getEvents().find((e) => e.id === id)
    if (!event) return null

    return {
      ...event,
      pricingTiers: Storage.getPricingTiers().filter((tier) => tier.eventId === id),
    }
  },

  // Pricing Tiers
  getPricingTiers: async (eventId: string): Promise<PricingTier[]> => {
    initializeMockData()
    return Storage.getPricingTiers()
      .filter((tier) => tier.eventId === eventId)
      .sort((a, b) => a.price - b.price)
  },

  getPricingTier: async (id: string): Promise<PricingTier | null> => {
    initializeMockData()
    const tier = Storage.getPricingTiers().find((t) => t.id === id)
    return tier || null
  },

  // Tickets
  createTicket: async (
    ticketData: Omit<Ticket, "id" | "createdAt" | "isValidated" | "validatedAt" | "qrCodeUrl">,
  ): Promise<Ticket> => {
    const ticketId = `ticket_${Date.now()}`
    const now = new Date().toISOString()

    // Generate QR code URL - this would be a URL that can be used to validate the ticket
    const qrCodeUrl = `/api/validate-ticket/${ticketId}`

    const ticket: Ticket = {
      ...ticketData,
      id: ticketId,
      isValidated: false,
      createdAt: now,
      validatedAt: null,
      qrCodeUrl,
    }

    Storage.addTicket(ticket)

    return ticket
  },

  getTickets: async (): Promise<Ticket[]> => {
    initializeMockData()
    return Storage.getTickets().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getTicketsWithDetails: async (): Promise<TicketWithDetails[]> => {
    initializeMockData()
    const tickets = Storage.getTickets()
    const events = Storage.getEvents()
    const pricingTiers = Storage.getPricingTiers()

    return tickets
      .map((ticket) => {
        const event = events.find((e) => e.id === ticket.eventId)
        const tier = pricingTiers.find((t) => t.id === ticket.tierId)
        if (!event || !tier) return null
        return { ...ticket, event, tier }
      })
      .filter((ticket): ticket is TicketWithDetails => ticket !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getTicket: async (id: string): Promise<Ticket | null> => {
    initializeMockData()
    const ticket = Storage.getTickets().find((t) => t.id === id)
    return ticket || null
  },

  getTicketWithDetails: async (id: string): Promise<TicketWithDetails | null> => {
    initializeMockData()
    const ticket = Storage.getTickets().find((t) => t.id === id)
    if (!ticket) return null

    const event = Storage.getEvents().find((e) => e.id === ticket.eventId)
    const tier = Storage.getPricingTiers().find((t) => t.id === ticket.tierId)

    if (!event || !tier) return null

    return { ...ticket, event, tier }
  },

  validateTicket: async (id: string): Promise<{ success: boolean; ticket?: TicketWithDetails }> => {
    initializeMockData()
    const ticket = Storage.getTickets().find((t) => t.id === id)
    if (!ticket) {
      return { success: false }
    }

    if (ticket.isValidated) {
      const event = Storage.getEvents().find((e) => e.id === ticket.eventId)
      const tier = Storage.getPricingTiers().find((t) => t.id === ticket.tierId)
      if (event && tier) {
        return { success: false, ticket: { ...ticket, event, tier } }
      }
      return { success: false }
    }

    // Validate the ticket
    const updatedTicket: Ticket = {
      ...ticket,
      isValidated: true,
      validatedAt: new Date().toISOString(),
    }

    Storage.updateTicket(updatedTicket)

    const event = Storage.getEvents().find((e) => e.id === ticket.eventId)
    const tier = Storage.getPricingTiers().find((t) => t.id === ticket.tierId)

    if (event && tier) {
      return { success: true, ticket: { ...updatedTicket, event, tier } }
    }

    return { success: true }
  },

  // Analytics
  getEventStats: async (): Promise<{
    totalEvents: number
    totalTickets: number
    validatedTickets: number
    totalRevenue: number
  }> => {
    initializeMockData()
    const events = Storage.getEvents()
    const tickets = Storage.getTickets()
    const pricingTiers = Storage.getPricingTiers()

    const totalEvents = events.length
    const totalTickets = tickets.length
    const validatedTickets = tickets.filter((t) => t.isValidated).length

    const totalRevenue = tickets.reduce((sum, ticket) => {
      const tier = pricingTiers.find((t) => t.id === ticket.tierId)
      return sum + (tier?.price || 0)
    }, 0)

    return {
      totalEvents,
      totalTickets,
      validatedTickets,
      totalRevenue,
    }
  },
}
