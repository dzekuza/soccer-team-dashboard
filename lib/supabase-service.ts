import { createClient } from '@supabase/supabase-js';
import type { Event, PricingTier, Ticket, EventWithTiers, TicketWithDetails, Subscription, UserSubscription, Team, TicketListItem, EventStats, EmailTemplate, Fan, Player, Match } from "./types"
import { v4 as uuidv4 } from "uuid"
import QRCode from "qrcode"

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export const supabaseService = {
  // Events
  createEvent: async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
    pricingTiersData: Omit<PricingTier, "id" | "eventId" | "soldQuantity">[],
    client: any
  ): Promise<EventWithTiers> => {
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
      const pricingTiersToInsert = pricingTiersData.map((tier: Omit<PricingTier, "id" | "eventId" | "soldQuantity">) => ({
        event_id: event.id,
        name: tier.name,
        price: tier.price,
        quantity: tier.quantity,
        sold_quantity: 0,
      }))
      const { data: pricingTiers, error: tiersError } = await supabaseAdmin
        .from("pricing_tiers")
        .insert(pricingTiersToInsert)
        .select()

      if (tiersError) {
        console.error("Error creating pricing tiers:", tiersError)
        // Rollback event creation? For now, we just throw.
        throw new Error(`Failed to create pricing tiers: ${tiersError.message}`)
      }
      
      const convertedEvent: Event = {
        id: event.id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
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
    try {
      const { data, error } = await supabaseAdmin.from("events").select("*").order("created_at", { ascending: false })

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
    try {
      const { data, error } = await supabaseAdmin
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
    try {
      const { data, error } = await supabaseAdmin.from("events").select("*").eq("id", id).single()

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
    try {
      const { data, error } = await supabaseAdmin
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

  getTicketsWithDetails: async (): Promise<{ data: TicketWithDetails[] | null; error: Error | null }> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .select(`
          id, event_id, tier_id, purchaser_name, purchaser_email, is_validated, created_at, validated_at, qr_code_url,
          events(*),
          pricing_tiers(*)
        `)
        .order("created_at", { ascending: false });
  
      if (error) {
        throw error;
      }
      
      // First, filter out any tickets that are missing the related event or tier data.
      const validData = (data || []).filter((t: any) => t.events && t.pricing_tiers);

      // Now, map the filtered data, which guarantees that events and pricing_tiers exist.
      const mappedData: TicketWithDetails[] = validData.map((t: any) => ({
        id: t.id,
        eventId: t.event_id,
        tierId: t.tier_id,
        purchaserName: t.purchaser_name,
        purchaserEmail: t.purchaser_email,
        isValidated: t.is_validated,
        createdAt: t.created_at,
        validatedAt: t.validated_at ?? null,
        qrCodeUrl: t.qr_code_url ?? '',
        userId: t.user_id ?? undefined,
        event: { // No need for a conditional check, as it's guaranteed by the filter
          id: t.events.id,
          title: t.events.title,
          description: t.events.description,
          date: t.events.date,
          time: t.events.time,
          location: t.events.location,
          createdAt: t.events.created_at,
          updatedAt: t.events.updated_at,
          team1Id: t.events.team1_id,
          team2Id: t.events.team2_id,
          coverImageUrl: t.events.cover_image_url ?? undefined,
        },
        tier: { // No need for a conditional check
          id: t.pricing_tiers.id,
          eventId: t.pricing_tiers.event_id,
          name: t.pricing_tiers.name,
          price: t.pricing_tiers.price,
          quantity: t.pricing_tiers.quantity,
          soldQuantity: t.pricing_tiers.sold_quantity,
        },
      }));
  
      return { data: mappedData, error: null };
  
    } catch (error) {
      console.error("Supabase Service Error in getTicketsWithDetails:", error);
      return { data: null, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  },

  // Pricing Tiers
  getPricingTiers: async (eventId: string): Promise<PricingTier[]> => {
    try {
      const { data, error } = await supabaseAdmin
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
    try {
      const { data, error } = await supabaseAdmin.from("pricing_tiers").select("*").eq("id", id).single()

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
    ticketData: Omit<Ticket, "id" | "createdAt" | "qrCodeUrl" | "isValidated" | "validatedAt">
  ): Promise<Ticket> => {
    try {
      const ticketId = uuidv4()
      // QR code is just the ticket ID
      const qrCodeValue = ticketId
      const qrCodeUrl = await QRCode.toDataURL(qrCodeValue)

      const { data, error } = await supabaseAdmin
        .from("tickets")
        .insert({
          id: ticketId,
          event_id: ticketData.eventId,
          tier_id: ticketData.tierId,
          purchaser_name: ticketData.purchaserName,
          purchaser_surname: ticketData.purchaserSurname || null,
          purchaser_email: ticketData.purchaserEmail,
          is_validated: false,
          qr_code_url: qrCodeUrl,
          user_id: ticketData.userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating ticket:", error)
        throw new Error(`Failed to create ticket: ${error.message}`)
      }

      return {
        id: data.id,
        eventId: data.event_id,
        tierId: data.tier_id,
        purchaserName: data.purchaser_name,
        purchaserEmail: data.purchaser_email,
        isValidated: data.is_validated,
        qrCodeUrl: data.qr_code_url,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
      }
    } catch (error) {
      console.error("Supabase Service: Error in createTicket:", error)
      throw error
    }
  },

  getTickets: async (): Promise<TicketListItem[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .select(`
          id,
          purchaser_name,
          purchaser_email,
          is_validated,
          created_at,
          event:events (title, date),
          tier:pricing_tiers (name, price)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tickets:", error)
        throw new Error(`Failed to fetch tickets: ${error.message}`)
      }

      return (data || []).map((ticket: any) => ({
        id: ticket.id,
        purchaserName: ticket.purchaser_name,
        purchaserEmail: ticket.purchaser_email,
        isValidated: ticket.is_validated,
        createdAt: ticket.created_at,
        event: {
          title: ticket.event.title,
          date: ticket.event.date,
        },
        tier: {
          name: ticket.tier.name,
          price: ticket.tier.price,
        },
      }))
    } catch (error) {
      console.error("Supabase Service: Error in getTickets:", error)
      throw error
    }
  },

  getTicketWithDetails: async (id: string): Promise<TicketWithDetails | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .select(`
          *,
          event:events (*),
          tier:pricing_tiers (*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error(`Error fetching ticket ${id} with details:`, error)
        throw new Error(`Failed to fetch ticket with details: ${error.message}`)
      }

      if (!data) return null

      // Fetch team details separately
      const team1 = data.event.team1_id ? await supabaseService.getTeamById(data.event.team1_id) : null;
      const team2 = data.event.team2_id ? await supabaseService.getTeamById(data.event.team2_id) : null;

      return {
        id: data.id,
        eventId: data.event_id,
        tierId: data.tier_id,
        purchaserName: data.purchaser_name,
        purchaserEmail: data.purchaser_email,
        isValidated: data.is_validated,
        qrCodeUrl: data.qr_code_url,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
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
          team1: team1 || undefined,
          team2: team2 || undefined,
          coverImageUrl: data.event.cover_image_url || undefined,
        },
        tier: {
          id: data.tier.id,
          eventId: data.tier.event_id,
          name: data.tier.name,
          price: data.tier.price,
          quantity: data.tier.quantity,
          soldQuantity: data.tier.sold_quantity,
        },
      }
    } catch (error) {
      console.error(`Supabase Service: Error in getTicketWithDetails for id ${id}:`, error)
      throw error
    }
  },

  validateTicket: async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .update({ is_validated: true, validated_at: new Date().toISOString() })
        .eq("id", id)
        .select()

      if (error) {
        console.error(`Error validating ticket ${id}:`, error)
        return false
      }
      return data !== null && data.length > 0
    } catch (error) {
      console.error(`Supabase Service: Error in validateTicket for id ${id}:`, error)
      return false
    }
  },

  // Subscriptions
  createSubscription: async (subData: Omit<Subscription, "id" | "createdAt">): Promise<Subscription> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .insert([{ ...subData }])
        .select()
        .single()

      if (error) {
        console.error("Error creating subscription:", error)
        throw new Error(`Failed to create subscription: ${error.message}`)
      }
      return data as Subscription
    } catch (error) {
      console.error("Supabase Service: Error in createSubscription:", error)
      throw error
    }
  },

  getSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching subscriptions:", error)
        throw new Error(`Failed to fetch subscriptions: ${error.message}`)
      }
      return data || []
    } catch (error) {
      console.error("Supabase Service: Error in getSubscriptions:", error)
      throw error
    }
  },

  getSubscriptionById: async (id: string): Promise<Subscription | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching subscription by ID:', error);
        throw new Error(`Failed to fetch subscription: ${error.message}`);
      }

      return data as Subscription;
    } catch (error) {
      console.error('Supabase Service: Error in getSubscriptionById:', error);
      throw error;
    }
  },

  getUserSubscriptions: async (): Promise<UserSubscription[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("user_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching user subscriptions:", error);
        throw new Error(`Failed to fetch user subscriptions: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error("Supabase Service: Error in getUserSubscriptions:", error);
      throw error;
    }
  },

  // Teams
  getTeams: async (): Promise<Team[]> => {
    try {
      const { data, error } = await supabaseAdmin.from("teams").select("*")
      if (error) {
        console.error("Error fetching teams:", error)
        throw new Error(`Failed to fetch teams: ${error.message}`)
      }
      return (data || []).map((team: any) => ({
        id: team.id,
        team_name: team.team_name,
        logo: team.logo,
        created_at: team.created_at
      }));
    } catch (error) {
      console.error("Supabase Service: Error in getTeams:", error)
      throw error
    }
  },

  getTeamById: async (id: string): Promise<Team | null> => {
    try {
      const { data, error } = await supabaseAdmin.from("teams").select("*").eq("id", id).single()
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error(`Error fetching team ${id}:`, error)
        throw new Error(`Failed to fetch team: ${error.message}`)
      }
      return {
        id: data.id,
        team_name: data.team_name,
        logo: data.logo,
        created_at: data.created_at
      };
    } catch (error) {
      console.error(`Supabase Service: Error in getTeamById for id ${id}:`, error)
      throw error
    }
  },
  
  // Fans (aggregated data)
  getFans: async (): Promise<Fan[]> => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_fans_aggregated');

      if (error) {
        console.error("Error fetching aggregated fan data:", error);
        throw new Error(`Failed to fetch aggregated fan data: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error("Supabase Service: Error in getFans:", error);
      throw error;
    }
  },

  getEventStats: async (): Promise<EventStats> => {
    try {
      const { data: eventsData, error: eventsError } = await supabaseAdmin
        .from("events")
        .select("id", { count: "exact" });
      if (eventsError) throw new Error(`Failed to count events: ${eventsError.message}`);
      const totalEvents = eventsData?.length || 0;
      
      const { data: ticketsData, error: ticketsError } = await supabaseAdmin
        .from("tickets")
        .select("is_validated, tier_id, pricing_tiers (price)");
      if (ticketsError) throw new Error(`Failed to fetch tickets for stats: ${ticketsError.message}`);

      const totalTickets = ticketsData?.length || 0;
      const validatedTickets = ticketsData?.filter(t => t.is_validated).length || 0;
      const totalRevenue = ticketsData?.reduce((acc, ticket) => {
        const tier = Array.isArray(ticket.pricing_tiers) ? ticket.pricing_tiers[0] : ticket.pricing_tiers;
        return acc + (tier?.price || 0);
      }, 0) || 0;

      return {
        totalEvents,
        totalTickets,
        validatedTickets,
        ticketsScanned: validatedTickets,
        totalRevenue,
        revenue: totalRevenue,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getEventStats:", error);
      return {
        totalEvents: 0,
        totalTickets: 0,
        validatedTickets: 0,
        ticketsScanned: 0,
        totalRevenue: 0,
        revenue: 0,
      };
    }
  },

  // Users
  getUser: async (id: string): Promise<any> => {
    try {
      // Implementation of getUser function
    } catch (error) {
      console.error("Supabase Service: Error in getUser:", error);
      throw error;
    }
  },

  // Email Templates
  getEmailTemplateByName: async (name: string): Promise<EmailTemplate | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("email_templates")
        .select("*")
        .eq("name", name)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        console.error(`Error fetching template ${name}:`, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Supabase Service: Error in getEmailTemplateByName for ${name}:`, error);
      throw error;
    }
  },

  // Players
  getPlayers: async (teamKey?: "BANGA A" | "BANGA B" | "BANGA M" | "all"): Promise<{ data: Player[] | null; error: Error | null; }> => {
    try {
      let query = supabaseAdmin.from("banga_playerss").select("*");

      if (teamKey && teamKey !== "all") {
        query = query.eq("team_key", teamKey);
      }

      const { data, error } = await query.order("name_last", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching players:", error);
      return { data: null, error: error as Error };
    }
  },

  // Matches
  getMatches: async (): Promise<{ data: Match[] | null; error: Error | null; }> => {
    try {
      const { data, error } = await supabaseAdmin.from("fixtures_all_new").select("*").order("match_date", { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching matches:", error);
      return { data: null, error: error as Error };
    }
  },
}
