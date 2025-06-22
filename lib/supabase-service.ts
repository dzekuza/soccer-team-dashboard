import { supabase, testSupabaseConnection } from "./supabase"
import type { Event, PricingTier, Ticket, EventWithTiers, TicketWithDetails, Subscription, UserSubscription } from "./types"
import { generateUniqueId } from "./utils"
import { v4 as uuidv4 } from "uuid"

/*
Database Table Overview (Multi-team/Whitelabel Soccer Dashboard)

- events: All events created by different teams. Each event is assigned to a project_teams ID, so only that team will see their events.
- pricing_tiers: All pricing tiers created by different teams for events. Each pricing tier is assigned to a project_teams ID, so only that team will see their pricing.
- project_teams: All companies/teams/projects registered as a business, with admins and assigned managers.
- subscriptions: All subscriptions created by different projects. Each subscription is assigned to a project_teams ID, so only that team will see their subscriptions.
- teams: List of teams uploaded so they can be selected as team 1 or team 2 when creating an event.
- tickets: All tickets created by different projects. Each ticket is assigned to a project_teams ID, so only that team will see their tickets.
- user_subscriptions: All subscriptions purchased by customers for a team. Each subscriber is assigned to a project_teams ID, so only that team will see their subscribers.
- users: All registered users (admins, managers, staff, etc.).
*/

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
    client: any
  ): Promise<EventWithTiers> => {
    await ensureConnection()
    console.log("Supabase Service: Creating event with data:", eventData, pricingTiersData)

    try {
      // Insert event using the provided client (with user JWT)
      const { data: event, error: eventError } = await client
        .from("events")
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          team1_id: eventData.team1Id,
          team2_id: eventData.team2Id,
          cover_image_url: eventData.coverImageUrl || null,
        })
        .select()
        .single()

      if (eventError) {
        console.error("Error creating event:", eventError)
        throw new Error(`Failed to create event: ${eventError.message}`)
      }

      // Insert pricing tiers using service role client
      const { createClient } = require('@supabase/supabase-js');
      const serviceSupabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const pricingTiersToInsert = pricingTiersData.map((tier: Omit<PricingTier, "id" | "eventId" | "soldQuantity">) => ({
        event_id: event.id,
        name: tier.name,
        price: tier.price,
        quantity: tier.quantity,
        sold_quantity: 0,
      }))
      const { data: pricingTiers, error: tiersError } = await serviceSupabase
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
        team1Id: event.team1_id,
        team2Id: event.team2_id,
        coverImageUrl: event.cover_image_url || undefined,
      }

      const convertedTiers: PricingTier[] = (pricingTiers || []).map((tier: any): PricingTier => ({
        id: tier.id,
        eventId: tier.event_id,
        name: tier.name,
        price: tier.price,
        quantity: tier.quantity,
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
            purchaser_surname: null,
            purchaser_email: null,
            is_validated: false,
            created_at: new Date().toISOString(),
            validated_at: null,
            qr_code_url: `/api/validate-ticket/${ticketId}`,
          });
        }
      }
      if (ticketsToInsert.length > 0) {
        const { error: ticketsError } = await client
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

      return (data || []).map((event: any): Event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        team1Id: event.team1_id,
        team2Id: event.team2_id,
        coverImageUrl: event.cover_image_url || undefined,
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

      return (data || []).map((event: any): EventWithTiers => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        team1Id: event.team1_id,
        team2Id: event.team2_id,
        pricingTiers: (event.pricing_tiers || []).map((tier: any): PricingTier => ({
          id: tier.id,
          eventId: tier.event_id,
          name: tier.name,
          price: tier.price,
          quantity: tier.quantity,
          soldQuantity: tier.sold_quantity,
        })),
        coverImageUrl: event.cover_image_url || undefined,
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
        team1Id: data.team1_id,
        team2Id: data.team2_id,
        coverImageUrl: data.cover_image_url || undefined,
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
        team1Id: data.team1_id,
        team2Id: data.team2_id,
        pricingTiers: (data.pricing_tiers || []).map((tier: any): PricingTier => ({
          id: tier.id,
          eventId: tier.event_id,
          name: tier.name,
          price: tier.price,
          quantity: tier.quantity,
          soldQuantity: tier.sold_quantity,
        })),
        coverImageUrl: data.cover_image_url || undefined,
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

      return (data || []).map((tier: any): PricingTier => ({
        id: tier.id,
        eventId: tier.event_id,
        name: tier.name,
        price: tier.price,
        quantity: tier.quantity,
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
        quantity: data.quantity,
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
    customSupabase?: any
  ): Promise<Ticket> => {
    await ensureConnection()
    const client = customSupabase || supabase

    try {
      const ticketId = uuidv4();
      const qrCodeUrl = `/api/validate-ticket/${ticketId}`

      const { data, error } = await client
        .from("tickets")
        .insert({
          id: ticketId,
          event_id: ticketData.eventId,
          tier_id: ticketData.tierId,
          purchaser_name: ticketData.purchaserName,
          purchaser_surname: ticketData.purchaserSurname,
          purchaser_email: ticketData.purchaserEmail,
          qr_code_url: qrCodeUrl,
          user_id: ticketData.userId,
          team_id: ticketData.team1Id,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating ticket:", error)
        throw new Error(`Failed to create ticket: ${error.message}`)
      }

      // Update sold quantity
      const { data: updateData, error: updateError } = await client.rpc("increment_sold_quantity", {
        tier_id: ticketData.tierId,
      })
      console.log('[DEBUG] Update sold quantity RPC:', { updateData, updateError })
      if (updateError) {
        console.warn("Warning: Could not update sold quantity:", updateError)
        // Don't throw error here, ticket was created successfully
      }

      return {
        id: data.id,
        eventId: data.event_id,
        tierId: data.tier_id,
        purchaserName: data.purchaser_name,
        purchaserSurname: data.purchaser_surname,
        purchaserEmail: data.purchaser_email,
        isValidated: data.is_validated,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
        qrCodeUrl: data.qr_code_url,
        userId: data.user_id,
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

      return (data || []).map((ticket: any): Ticket => ({
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserSurname: ticket.purchaser_surname,
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

      return (data || []).map((ticket: any) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserSurname: ticket.purchaser_surname,
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
          team1Id: ticket.events.team1_id,
          team2Id: ticket.events.team2_id,
          coverImageUrl: ticket.events.cover_image_url || undefined,
        },
        tier: {
          id: ticket.pricing_tiers.id,
          eventId: ticket.pricing_tiers.event_id,
          name: ticket.pricing_tiers.name,
          price: ticket.pricing_tiers.price,
          quantity: ticket.pricing_tiers.quantity,
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
        purchaserSurname: data.purchaser_surname,
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
        purchaserSurname: data.purchaser_surname,
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
          team1Id: data.events.team1_id,
          team2Id: data.events.team2_id,
          coverImageUrl: data.events.cover_image_url || undefined,
        },
        tier: {
          id: data.pricing_tiers.id,
          eventId: data.pricing_tiers.event_id,
          name: data.pricing_tiers.name,
          price: data.pricing_tiers.price,
          quantity: data.pricing_tiers.quantity,
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
        totalRevenue = revenueResult.data.reduce((sum: number, ticket: { pricing_tiers: any[] }) => {
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

  getTeams: async () => {
    await ensureConnection();
    const { data, error } = await supabase
      .from("teams")
      .select("id, team_name, logo, created_at");
    if (error) throw new Error(error.message);
    return data || [];
  },

  getTeamById: async (id: string) => {
    await ensureConnection();
    const { data, error } = await supabase
      .from("teams")
      .select("id, team_name, logo, created_at")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  getSubscriptions: async (): Promise<Subscription[]> => {
    await ensureConnection()
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map((s: any): Subscription => ({
      id: s.id,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      purchaser_name: s.purchaser_name,
      purchaser_surname: s.purchaser_surname,
      purchaser_email: s.purchaser_email,
      valid_from: s.valid_from,
      valid_to: s.valid_to,
      qr_code_url: s.qr_code_url,
      owner_id: s.owner_id,
    }))
  },

  createSubscription: async (sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => {
    await ensureConnection()
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to create a subscription.");
    }
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        purchaser_name: sub.purchaser_name,
        purchaser_surname: sub.purchaser_surname,
        purchaser_email: sub.purchaser_email,
        valid_from: sub.valid_from,
        valid_to: sub.valid_to,
        qr_code_url: sub.qr_code_url,
        owner_id: sub.owner_id,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      purchaser_name: data.purchaser_name,
      purchaser_surname: data.purchaser_surname,
      purchaser_email: data.purchaser_email,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      qr_code_url: data.qr_code_url,
      owner_id: data.owner_id,
    }
  },

  getUserSubscriptions: async (userId: string): Promise<UserSubscription[]> => {
    await ensureConnection()
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map((s: any): UserSubscription => ({
      id: s.id,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      purchaser_name: s.purchaser_name,
      purchaser_surname: s.purchaser_surname,
      purchaser_email: s.purchaser_email,
      valid_from: s.valid_from,
      valid_to: s.valid_to,
      qr_code_url: s.qr_code_url,
      owner_id: s.owner_id,
    }))
  },

  getProjectTeamById: async (id: string) => {
    await ensureConnection();
    const { data, error } = await supabase
      .from("project_teams")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  updateProjectTeam: async (id: string, updates: Record<string, any>) => {
    await ensureConnection();
    const { data, error } = await supabase
      .from("project_teams")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  getDashboardStats: async () => {
    const { data: events, error: eventsError } = await supabase.from("events").select("id");
    if (eventsError) throw eventsError;

    const { data: tickets, error: ticketsError } = await supabase.from("tickets").select("id, is_validated");
    if (ticketsError) throw ticketsError;

    const { data: pricingTiers, error: pricingTiersError } = await supabase.from("pricing_tiers").select("price, sold_quantity");
    if (pricingTiersError) throw pricingTiersError;
    
    const totalRevenue = (pricingTiers || []).reduce((sum: number, tier: { price: number; sold_quantity: number }) => sum + (tier.price * tier.sold_quantity), 0);

    return {
        totalEvents: events?.length || 0,
        totalTickets: tickets?.length || 0,
        validatedTickets: (tickets || []).filter((t: { is_validated: boolean }) => t.is_validated).length || 0,
        totalRevenue,
    };
  },
}
