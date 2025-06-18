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
      const pricingTiersToInsert = pricingTiersData.map((tier: any) => ({
        event_id: event.id,
        name: tier.name,
        price: tier.price,
        max_quantity: tier.maxQuantity,
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

      const convertedTiers: PricingTier[] = (pricingTiers || []).map((tier: any) => ({
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

      return (data || []).map((event) => ({
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

      return (data || []).map((event) => ({
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
        pricingTiers: (event.pricing_tiers || []).map((tier: any) => ({
          id: tier.id,
          eventId: tier.event_id,
          name: tier.name,
          price: tier.price,
          maxQuantity: tier.max_quantity,
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
        pricingTiers: (data.pricing_tiers || []).map((tier: any) => ({
          id: tier.id,
          eventId: tier.event_id,
          name: tier.name,
          price: tier.price,
          maxQuantity: tier.max_quantity,
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
    customSupabase?: any
  ): Promise<Ticket> => {
    await ensureConnection()
    const client = customSupabase || supabase

    try {
      const ticketId = uuidv4();
      const qrCodeUrl = `/api/validate-ticket/${ticketId}`

      console.log('[DEBUG] Ticket insert payload:', {
        id: ticketId,
        event_id: ticketData.event_id,
        tier_id: ticketData.tier_id,
        purchaser_name: ticketData.purchaser_name,
        purchaser_email: ticketData.purchaser_email,
        qr_code_url: qrCodeUrl,
      });
      let data, error;
      try {
        ({ data, error } = await client
          .from("tickets")
          .insert({
            id: ticketId,
            event_id: ticketData.event_id,
            tier_id: ticketData.tier_id,
            purchaser_name: ticketData.purchaser_name,
            purchaser_email: ticketData.purchaser_email,
            qr_code_url: qrCodeUrl,
          })
          .select()
          .single());
      } catch (insertErr) {
        console.error('[ERROR] Exception during ticket insert:', insertErr);
        throw insertErr;
      }

      if (error || !data) {
        console.error('[ERROR] Supabase insert error or null data:', { error, data, payload: {
          id: ticketId,
          event_id: ticketData.event_id,
          tier_id: ticketData.tier_id,
          purchaser_name: ticketData.purchaser_name,
          purchaser_email: ticketData.purchaser_email,
          qr_code_url: qrCodeUrl,
        }});
        throw new Error('Failed to create ticket: ' + (error?.message || 'No data returned'));
      }

      // Update sold quantity
      const { data: updateData, error: updateError } = await client.rpc("increment_sold_quantity", {
        tier_id: ticketData.tier_id,
      })
      console.log('[DEBUG] Update sold quantity RPC:', { updateData, updateError })
      if (updateError) {
        console.warn("Warning: Could not update sold quantity:", updateError)
        // Don't throw error here, ticket was created successfully
      }

      return {
        id: data.id,
        event_id: data.event_id,
        tier_id: data.tier_id,
        purchaser_name: data.purchaser_name,
        purchaser_email: data.purchaser_email,
        is_validated: data.is_validated,
        created_at: data.created_at,
        validated_at: data.validated_at,
        qr_code_url: data.qr_code_url,
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
        event_id: ticket.event_id,
        tier_id: ticket.tier_id,
        purchaser_name: ticket.purchaser_name,
        purchaser_email: ticket.purchaser_email,
        is_validated: ticket.is_validated,
        created_at: ticket.created_at,
        validated_at: ticket.validated_at,
        qr_code_url: ticket.qr_code_url,
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
        event_id: ticket.event_id,
        tier_id: ticket.tier_id,
        purchaser_name: ticket.purchaser_name,
        purchaser_email: ticket.purchaser_email,
        is_validated: ticket.is_validated,
        created_at: ticket.created_at,
        validated_at: ticket.validated_at,
        qr_code_url: ticket.qr_code_url,
        event: {
          id: ticket.events.id,
          title: ticket.events.title,
          description: ticket.events.description,
          date: ticket.events.date,
          time: ticket.events.time,
          location: ticket.events.location,
          createdAt: ticket.events.created_at,
          updatedAt: ticket.events.updated_at,
          coverImageUrl: ticket.events.cover_image_url || undefined,
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
        event_id: data.event_id,
        tier_id: data.tier_id,
        purchaser_name: data.purchaser_name,
        purchaser_email: data.purchaser_email,
        is_validated: data.is_validated,
        created_at: data.created_at,
        validated_at: data.validated_at,
        qr_code_url: data.qr_code_url,
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

      if (!data.event || !data.tier) {
        console.error('Ticket event or tier missing for ticket ID:', id);
        return null;
      }
      return {
        id: data.id,
        event_id: data.event_id,
        tier_id: data.tier_id,
        purchaser_name: data.purchaser_name,
        purchaser_email: data.purchaser_email,
        is_validated: data.is_validated,
        created_at: data.created_at,
        validated_at: data.validated_at ?? null,
        qr_code_url: data.qr_code_url ?? '',
        event_cover_image_url: data.event_cover_image_url ?? undefined,
        event_date: data.event_date ?? undefined,
        event_title: data.event_title ?? undefined,
        event_description: data.event_description ?? undefined,
        event_location: data.event_location ?? undefined,
        event_time: data.event_time ?? undefined,
        team1_id: data.team1_id ?? undefined,
        team2_id: data.team2_id ?? undefined,
        pdf_url: data.pdf_url ?? undefined,
        event: {
          id: data.event.id,
          title: data.event.title,
          description: data.event.description,
          date: data.event.date,
          time: data.event.time,
          location: data.event.location,
          createdAt: data.event.created_at,
          updatedAt: data.event.updated_at,
          team1Id: data.event.team1_id,
          team2Id: data.event.team2_id,
          coverImageUrl: data.event.cover_image_url || undefined,
        },
        tier: {
          id: data.tier.id,
          eventId: data.tier.event_id,
          name: data.tier.name,
          price: data.tier.price,
          maxQuantity: data.tier.max_quantity,
          soldQuantity: data.tier.sold_quantity,
        },
      };
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

      if (ticket.is_validated) {
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
    updates: { purchaser_name?: string; purchaser_email?: string }
  ): Promise<void> => {
    await ensureConnection();
    const { error } = await supabase
      .from("tickets")
      .update({
        purchaser_name: updates.purchaser_name,
        purchaser_email: updates.purchaser_email,
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
    return (data || []).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      price: Number(s.price),
      durationDays: s.duration_days,
      createdAt: s.created_at,
    }))
  },

  createSubscription: async (sub: Omit<Subscription, "id" | "createdAt">) => {
    await ensureConnection()
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to create a subscription.");
    }
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        title: sub.title,
        description: sub.description,
        price: sub.price,
        duration_days: sub.durationDays,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: Number(data.price),
      durationDays: data.duration_days,
      createdAt: data.created_at,
    }
  },

  getUserSubscriptions: async (userId: string): Promise<UserSubscription[]> => {
    await ensureConnection()
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*, subscriptions(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map((us) => ({
      id: us.id,
      userId: us.user_id,
      subscriptionId: us.subscription_id,
      purchaseDate: us.purchase_date,
      expiresAt: us.expires_at,
      assignedBy: us.assigned_by,
      createdAt: us.created_at,
      subscription: us.subscriptions
        ? {
            id: us.subscriptions.id,
            title: us.subscriptions.title,
            description: us.subscriptions.description,
            price: Number(us.subscriptions.price),
            durationDays: us.subscriptions.duration_days,
            createdAt: us.subscriptions.created_at,
          }
        : undefined,
    }))
  },

  assignSubscriptionToUser: async (userId: string, subscriptionId: string, assignedBy?: string) => {
    await ensureConnection()
    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        assigned_by: assignedBy || null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  getAllSubscriberEmails: async (): Promise<{ email: string, name?: string }[]> => {
    await ensureConnection();
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('user_id, users:user_id(email, name)')
    if (error) throw new Error(error.message)
    // Deduplicate by email
    const emails = new Map<string, { email: string, name?: string }>()
    for (const row of data || []) {
      // users can be an object or undefined/null
      const userObj = row.users && !Array.isArray(row.users) ? row.users : Array.isArray(row.users) ? row.users[0] : undefined;
      const email = userObj?.email;
      if (email && !emails.has(email)) {
        emails.set(email, { email, name: userObj?.name });
      }
    }
    return Array.from(emails.values())
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

  /**
   * Fetch a ticket by its ID, including event and team IDs
   */
  getTicketById: async (ticketId: string): Promise<TicketWithDetails | null> => {
    await ensureConnection();
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(*),
        tier:pricing_tiers(*)
      `)
      .eq('id', ticketId)
      .single();
    if (error) {
      console.error('Error fetching ticket by ID:', error);
      return null;
    }
    if (!data.event || !data.tier) {
      console.error('Ticket event or tier missing for ticket ID:', ticketId);
      return null;
    }
    return {
      id: data.id,
      event_id: data.event_id,
      tier_id: data.tier_id,
      purchaser_name: data.purchaser_name,
      purchaser_email: data.purchaser_email,
      is_validated: data.is_validated,
      created_at: data.created_at,
      validated_at: data.validated_at ?? null,
      qr_code_url: data.qr_code_url ?? '',
      event_cover_image_url: data.event_cover_image_url ?? undefined,
      event_date: data.event_date ?? undefined,
      event_title: data.event_title ?? undefined,
      event_description: data.event_description ?? undefined,
      event_location: data.event_location ?? undefined,
      event_time: data.event_time ?? undefined,
      team1_id: data.team1_id ?? undefined,
      team2_id: data.team2_id ?? undefined,
      pdf_url: data.pdf_url ?? undefined,
      event: {
        id: data.event.id,
        title: data.event.title,
        description: data.event.description,
        date: data.event.date,
        time: data.event.time,
        location: data.event.location,
        createdAt: data.event.created_at,
        updatedAt: data.event.updated_at,
        team1Id: data.event.team1_id,
        team2Id: data.event.team2_id,
        coverImageUrl: data.event.cover_image_url || undefined,
      },
      tier: {
        id: data.tier.id,
        eventId: data.tier.event_id,
        name: data.tier.name,
        price: data.tier.price,
        maxQuantity: data.tier.max_quantity,
        soldQuantity: data.tier.sold_quantity,
      },
    };
  },
}
