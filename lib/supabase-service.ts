import { supabase, testSupabaseConnection } from "./supabase"
import type { Event, PricingTier, Ticket, EventWithTiers, TicketWithDetails } from "./types"
import { generateUniqueId } from "./utils"
import { v4 as uuidv4 } from "uuid"

// Initialize and test connection
let connectionTested = false

async function ensureConnection() {
  if (!connectionTested) {
    const isConnected = await testSupabaseConnection()
    if (!isConnected) {
      throw new Error("Failed to connect to Supabase")
    }
    connectionTested = true
  }
}

export const supabaseService = {
  // Events
  createEvent: async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
    pricingTiersData: Omit<PricingTier, "id" | "eventId" | "soldQuantity">[],
  ): Promise<EventWithTiers> => {
    await ensureConnection()
    console.log("Supabase Service: Creating event with data:", eventData, pricingTiersData)

    try {
      // Insert event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
        })
        .select()
        .single()

      if (eventError) {
        console.error("Error creating event:", eventError)
        throw new Error(`Failed to create event: ${eventError.message}`)
      }

      // Insert pricing tiers
      const pricingTiersToInsert = pricingTiersData.map((tier) => ({
        event_id: event.id,
        name: tier.name,
        price: tier.price,
        max_quantity: tier.maxQuantity,
        sold_quantity: 0,
      }))

      const { data: pricingTiers, error: tiersError } = await supabase
        .from("pricing_tiers")
        .insert(pricingTiersToInsert)
        .select()

      if (tiersError) {
        console.error("Error creating pricing tiers:", tiersError)
        throw new Error(`Failed to create pricing tiers: ${tiersError.message}`)
      }

      // Convert to our types
      const convertedEvent: Event = {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }

      const convertedTiers: PricingTier[] = (pricingTiers || []).map((tier) => ({
        id: tier.id,
        eventId: tier.event_id,
        name: tier.name,
        price: tier.price,
        maxQuantity: tier.max_quantity,
        soldQuantity: tier.sold_quantity,
      }))

      // --- NEW: Generate tickets for each tier based on ticketCount ---
      // pricingTiersData is the original array, so we can match ticketCount
      const ticketsToInsert = [];
      for (let i = 0; i < pricingTiersData.length; i++) {
        const tier = pricingTiersData[i];
        const createdTier = pricingTiers[i];
        // Use ticketCount from incoming data (not part of PricingTier type)
        const ticketCount = (tier as any).ticketCount || 0;
        for (let j = 0; j < ticketCount; j++) {
          const ticketId = uuidv4();
          ticketsToInsert.push({
            id: ticketId,
            event_id: event.id,
            tier_id: createdTier.id,
            purchaser_name: null,
            purchaser_email: null,
            is_validated: false,
            created_at: new Date().toISOString(),
            validated_at: null,
            qr_code_url: `/api/validate-ticket/${ticketId}`,
          });
        }
      }
      if (ticketsToInsert.length > 0) {
        const { error: ticketsError } = await supabase
          .from("tickets")
          .insert(ticketsToInsert);
        if (ticketsError) {
          console.error("Error creating tickets:", ticketsError);
          throw new Error(`Failed to create tickets: ${ticketsError.message}`);
        }
      }
      // --- END NEW ---

      return {
        ...convertedEvent,
        pricingTiers: convertedTiers,
      }
    } catch (error) {
      console.error("Supabase Service: Error in createEvent:", error)
      throw error
    }
  },

  getEvents: async (): Promise<Event[]> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching events:", error)
        throw new Error(`Failed to fetch events: ${error.message}`)
      }

      return (data || []).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }))
    } catch (error) {
      console.error("Supabase Service: Error in getEvents:", error)
      throw error
    }
  },

  getEventsWithTiers: async (): Promise<EventWithTiers[]> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          pricing_tiers (*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching events with tiers:", error)
        throw new Error(`Failed to fetch events with tiers: ${error.message}`)
      }

      return (data || []).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        pricingTiers: (event.pricing_tiers || []).map((tier: any) => ({
          id: tier.id,
          eventId: tier.event_id,
          name: tier.name,
          price: tier.price,
          maxQuantity: tier.max_quantity,
          soldQuantity: tier.sold_quantity,
        })),
      }))
    } catch (error) {
      console.error("Supabase Service: Error in getEventsWithTiers:", error)
      throw error
    }
  },

  getEvent: async (id: string): Promise<Event | null> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("Error fetching event:", error)
        throw new Error(`Failed to fetch event: ${error.message}`)
      }

      if (!data) return null

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error("Supabase Service: Error in getEvent:", error)
      throw error
    }
  },

  getEventWithTiers: async (id: string): Promise<EventWithTiers | null> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          pricing_tiers (*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("Error fetching event with tiers:", error)
        throw new Error(`Failed to fetch event with tiers: ${error.message}`)
      }

      if (!data) return null

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pricingTiers: (data.pricing_tiers || []).map((tier: any) => ({
          id: tier.id,
          eventId: tier.event_id,
          name: tier.name,
          price: tier.price,
          maxQuantity: tier.max_quantity,
          soldQuantity: tier.sold_quantity,
        })),
      }
    } catch (error) {
      console.error("Supabase Service: Error in getEventWithTiers:", error)
      throw error
    }
  },

  // Pricing Tiers
  getPricingTiers: async (eventId: string): Promise<PricingTier[]> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase
        .from("pricing_tiers")
        .select("*")
        .eq("event_id", eventId)
        .order("price", { ascending: true })

      if (error) {
        console.error("Error fetching pricing tiers:", error)
        throw new Error(`Failed to fetch pricing tiers: ${error.message}`)
      }

      return (data || []).map((tier) => ({
        id: tier.id,
        eventId: tier.event_id,
        name: tier.name,
        price: tier.price,
        maxQuantity: tier.max_quantity,
        soldQuantity: tier.sold_quantity,
      }))
    } catch (error) {
      console.error("Supabase Service: Error in getPricingTiers:", error)
      throw error
    }
  },

  getPricingTier: async (id: string): Promise<PricingTier | null> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase.from("pricing_tiers").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("Error fetching pricing tier:", error)
        throw new Error(`Failed to fetch pricing tier: ${error.message}`)
      }

      if (!data) return null

      return {
        id: data.id,
        eventId: data.event_id,
        name: data.name,
        price: data.price,
        maxQuantity: data.max_quantity,
        soldQuantity: data.sold_quantity,
      }
    } catch (error) {
      console.error("Supabase Service: Error in getPricingTier:", error)
      throw error
    }
  },

  // Tickets
  createTicket: async (
    ticketData: Omit<Ticket, "id" | "createdAt" | "isValidated" | "validatedAt" | "qrCodeUrl">,
  ): Promise<Ticket> => {
    await ensureConnection()

    try {
      const ticketId = uuidv4();
      const qrCodeUrl = `/api/validate-ticket/${ticketId}`

      const { data, error } = await supabase
        .from("tickets")
        .insert({
          id: ticketId,
          event_id: ticketData.eventId,
          tier_id: ticketData.tierId,
          purchaser_name: ticketData.purchaserName,
          purchaser_email: ticketData.purchaserEmail,
          qr_code_url: qrCodeUrl,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating ticket:", error)
        throw new Error(`Failed to create ticket: ${error.message}`)
      }

      // Update sold quantity
      const { error: updateError } = await supabase.rpc("increment_sold_quantity", {
        tier_id: ticketData.tierId,
      })

      if (updateError) {
        console.warn("Warning: Could not update sold quantity:", updateError)
        // Don't throw error here, ticket was created successfully
      }

      return {
        id: data.id,
        eventId: data.event_id,
        tierId: data.tier_id,
        purchaserName: data.purchaser_name,
        purchaserEmail: data.purchaser_email,
        isValidated: data.is_validated,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
        qrCodeUrl: data.qr_code_url,
      }
    } catch (error) {
      console.error("Supabase Service: Error in createTicket:", error)
      throw error
    }
  },

  getTickets: async (): Promise<Ticket[]> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tickets:", error)
        throw new Error(`Failed to fetch tickets: ${error.message}`)
      }

      return (data || []).map((ticket) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserEmail: ticket.purchaser_email,
        isValidated: ticket.is_validated,
        createdAt: ticket.created_at,
        validatedAt: ticket.validated_at,
        qrCodeUrl: ticket.qr_code_url,
      }))
    } catch (error) {
      console.error("Supabase Service: Error in getTickets:", error)
      throw error
    }
  },

  getTicketsWithDetails: async (): Promise<TicketWithDetails[]> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (*),
          pricing_tiers (*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tickets with details:", error)
        throw new Error(`Failed to fetch tickets with details: ${error.message}`)
      }

      return (data || []).map((ticket) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserEmail: ticket.purchaser_email,
        isValidated: ticket.is_validated,
        createdAt: ticket.created_at,
        validatedAt: ticket.validated_at,
        qrCodeUrl: ticket.qr_code_url,
        event: {
          id: ticket.events.id,
          title: ticket.events.title,
          description: ticket.events.description,
          date: ticket.events.date,
          time: ticket.events.time,
          location: ticket.events.location,
          createdAt: ticket.events.created_at,
          updatedAt: ticket.events.updated_at,
        },
        tier: {
          id: ticket.pricing_tiers.id,
          eventId: ticket.pricing_tiers.event_id,
          name: ticket.pricing_tiers.name,
          price: ticket.pricing_tiers.price,
          maxQuantity: ticket.pricing_tiers.max_quantity,
          soldQuantity: ticket.pricing_tiers.sold_quantity,
        },
      }))
    } catch (error) {
      console.error("Supabase Service: Error in getTicketsWithDetails:", error)
      throw error
    }
  },

  getTicket: async (id: string): Promise<Ticket | null> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase.from("tickets").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("Error fetching ticket:", error)
        throw new Error(`Failed to fetch ticket: ${error.message}`)
      }

      if (!data) return null

      return {
        id: data.id,
        eventId: data.event_id,
        tierId: data.tier_id,
        purchaserName: data.purchaser_name,
        purchaserEmail: data.purchaser_email,
        isValidated: data.is_validated,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
        qrCodeUrl: data.qr_code_url,
      }
    } catch (error) {
      console.error("Supabase Service: Error in getTicket:", error)
      throw error
    }
  },

  getTicketWithDetails: async (id: string): Promise<TicketWithDetails | null> => {
    await ensureConnection()

    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (*),
          pricing_tiers (*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("Error fetching ticket with details:", error)
        throw new Error(`Failed to fetch ticket with details: ${error.message}`)
      }

      if (!data) return null

      return {
        id: data.id,
        eventId: data.event_id,
        tierId: data.tier_id,
        purchaserName: data.purchaser_name,
        purchaserEmail: data.purchaser_email,
        isValidated: data.is_validated,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
        qrCodeUrl: data.qr_code_url,
        event: {
          id: data.events.id,
          title: data.events.title,
          description: data.events.description,
          date: data.events.date,
          time: data.events.time,
          location: data.events.location,
          createdAt: data.events.created_at,
          updatedAt: data.events.updated_at,
        },
        tier: {
          id: data.pricing_tiers.id,
          eventId: data.pricing_tiers.event_id,
          name: data.pricing_tiers.name,
          price: data.pricing_tiers.price,
          maxQuantity: data.pricing_tiers.max_quantity,
          soldQuantity: data.pricing_tiers.sold_quantity,
        },
      }
    } catch (error) {
      console.error("Supabase Service: Error in getTicketWithDetails:", error)
      throw error
    }
  },

  validateTicket: async (id: string): Promise<{ success: boolean; ticket?: TicketWithDetails }> => {
    await ensureConnection()

    try {
      // First get the ticket
      const ticket = await supabaseService.getTicketWithDetails(id)
      if (!ticket) {
        return { success: false }
      }

      if (ticket.isValidated) {
        return { success: false, ticket }
      }

      // Update the ticket
      const { error } = await supabase
        .from("tickets")
        .update({
          is_validated: true,
          validated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Error validating ticket:", error)
        throw new Error(`Failed to validate ticket: ${error.message}`)
      }

      // Return updated ticket
      const updatedTicket = await supabaseService.getTicketWithDetails(id)
      return { success: true, ticket: updatedTicket || undefined }
    } catch (error) {
      console.error("Supabase Service: Error in validateTicket:", error)
      throw error
    }
  },

  // Analytics
  getEventStats: async (): Promise<{
    totalEvents: number
    totalTickets: number
    validatedTickets: number
    totalRevenue: number
  }> => {
    await ensureConnection()

    try {
      const [eventsResult, ticketsResult, validatedResult, revenueResult] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("is_validated", true),
        supabase.from("tickets").select(`
          pricing_tiers (price)
        `),
      ])

      const totalEvents = eventsResult.count || 0
      const totalTickets = ticketsResult.count || 0
      const validatedTickets = validatedResult.count || 0

      let totalRevenue = 0
      if (revenueResult.data) {
        totalRevenue = revenueResult.data.reduce((sum, ticket: { pricing_tiers: any[] }) => {
          const price = Array.isArray(ticket.pricing_tiers) && ticket.pricing_tiers.length > 0 ? ticket.pricing_tiers[0]?.price : 0;
          return sum + (price || 0)
        }, 0)
      }

      return {
        totalEvents,
        totalTickets,
        validatedTickets,
        totalRevenue,
      }
    } catch (error) {
      console.error("Supabase Service: Error in getEventStats:", error)
      throw error
    }
  },

  updateTicket: async (
    id: string,
    updates: { purchaserName?: string; purchaserEmail?: string }
  ): Promise<void> => {
    await ensureConnection();
    const { error } = await supabase
      .from("tickets")
      .update({
        purchaser_name: updates.purchaserName,
        purchaser_email: updates.purchaserEmail,
      })
      .eq("id", id);
    if (error) {
      console.error("Error updating ticket:", error);
      throw new Error(`Failed to update ticket: ${error.message}`);
    }
  },
}
