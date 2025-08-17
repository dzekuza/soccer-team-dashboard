import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import type {
  EmailTemplate,
  Event,
  EventWithTiers,
  Fan,
  PricingTier,
  Subscription,
  SubscriptionType,
  Team,
  Ticket,
  TicketWithDetails,
} from "./types";
import { QRCodeService } from "./qr-code-service";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export { supabaseAdmin };

export const supabaseService = {
  // Events
  createEvent: async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ): Promise<Event> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("events")
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          team1_id: eventData.team1Id,
          team2_id: eventData.team2Id,
          cover_image_url: eventData.coverImageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        throw new Error(`Failed to create event: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        team1Id: data.team1_id,
        team2Id: data.team2_id,
        coverImageUrl: data.cover_image_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Supabase Service: Error in createEvent:", error);
      throw error;
    }
  },

  getEvents: async (): Promise<Event[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      return data.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        team1Id: event.team1_id,
        team2Id: event.team2_id,
        coverImageUrl: event.cover_image_url,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }));
    } catch (error) {
      console.error("Supabase Service: Error in getEvents:", error);
      throw error;
    }
  },

  getEventStats: async (): Promise<{
    totalEvents: number;
    totalTickets: number;
    totalRevenue: number;
    validatedTickets: number;
    ticketsScanned: number;
    revenue: number;
  }> => {
    try {
      // Get total events
      const { count: totalEvents } = await supabaseAdmin
        .from("events")
        .select("*", { count: "exact", head: true });

      // Get total tickets and validated tickets
      const { count: totalTickets } = await supabaseAdmin
        .from("tickets")
        .select("*", { count: "exact", head: true });

      const { count: validatedTickets } = await supabaseAdmin
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("is_validated", true);

      // Calculate total revenue from tickets
      const { data: ticketsWithPricing } = await supabaseAdmin
        .from("tickets")
        .select(`
          pricing_tier:pricing_tiers(price)
        `);

      const totalRevenue = ticketsWithPricing?.reduce((sum, ticket: any) => {
        return sum + (ticket.pricing_tier?.price || 0);
      }, 0) || 0;

      return {
        totalEvents: totalEvents || 0,
        totalTickets: totalTickets || 0,
        totalRevenue: totalRevenue,
        validatedTickets: validatedTickets || 0,
        ticketsScanned: validatedTickets || 0,
        revenue: totalRevenue,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getEventStats:", error);
      // Return default values if there's an error
      return {
        totalEvents: 0,
        totalTickets: 0,
        totalRevenue: 0,
        validatedTickets: 0,
        ticketsScanned: 0,
        revenue: 0,
      };
    }
  },

  getEventWithTiers: async (id: string): Promise<EventWithTiers | null> => {
    try {
      const { data: event, error } = await supabaseAdmin
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !event) {
        return null;
      }

      const { data: pricingTiers } = await supabaseAdmin
        .from("pricing_tiers")
        .select("*")
        .eq("event_id", id);

      // Transform pricing tiers to include soldQuantity
      const transformedTiers = (pricingTiers || []).map((tier) => ({
        id: tier.id,
        eventId: tier.event_id,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        quantity: tier.quantity,
        soldQuantity: tier.sold_quantity || 0,
      }));

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        team1Id: event.team1_id,
        team2Id: event.team2_id,
        coverImageUrl: event.cover_image_url,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        pricingTiers: transformedTiers,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getEventWithTiers:", error);
      throw error;
    }
  },

  getPricingTier: async (id: string): Promise<PricingTier | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("pricing_tiers")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        eventId: data.event_id,
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        soldQuantity: data.sold_quantity || 0,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getPricingTier:", error);
      throw error;
    }
  },

  // Tickets
  createTicket: async (
    ticketData: Omit<
      Ticket,
      "id" | "createdAt" | "qrCodeUrl" | "isValidated" | "validatedAt"
    >,
  ): Promise<Ticket> => {
    try {
      const ticketId = uuidv4();

      // First create the ticket without QR code
      const { data: ticket, error } = await supabaseAdmin
        .from("tickets")
        .insert({
          id: ticketId,
          event_id: ticketData.eventId,
          tier_id: ticketData.tierId,
          purchaser_name: ticketData.purchaserName,
          purchaser_surname: ticketData.purchaserSurname || null,
          purchaser_email: ticketData.purchaserEmail,
          is_validated: false,
        })
        .select(`
          *,
          event:events (*),
          pricing_tier:pricing_tiers (*)
        `)
        .single();

      if (error) {
        console.error("Error creating ticket:", error);
        throw new Error(`Failed to create ticket: ${error.message}`);
      }

      // Generate enhanced QR code with full ticket details
      const ticketWithDetails = {
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserEmail: ticket.purchaser_email,
        isValidated: ticket.is_validated,
        createdAt: ticket.created_at,
        validatedAt: ticket.validated_at,
        qrCodeUrl: "", // Will be updated below
        event: ticket.event,
        tier: ticket.pricing_tier,
      };

      const enhancedQRCodeUrl = await QRCodeService.updateTicketQRCode(
        ticketWithDetails,
      );

      // Update ticket with enhanced QR code
      const { error: updateError } = await supabaseAdmin
        .from("tickets")
        .update({
          qr_code_url: enhancedQRCodeUrl,
        })
        .eq("id", ticketId);

      if (updateError) {
        console.error("Error updating ticket with QR code:", updateError);
        // Don't throw error here, ticket was created successfully
      }

      return {
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserEmail: ticket.purchaser_email,
        isValidated: ticket.is_validated,
        qrCodeUrl: enhancedQRCodeUrl,
        createdAt: ticket.created_at,
        validatedAt: ticket.validated_at,
      };
    } catch (error) {
      console.error("Supabase Service: Error in createTicket:", error);
      throw error;
    }
  },

  getTickets: async (): Promise<TicketWithDetails[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .select(`
          *,
          event:events (*),
          pricing_tier:pricing_tiers (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        throw new Error(`Failed to fetch tickets: ${error.message}`);
      }

      return data.map((ticket) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        tierId: ticket.tier_id,
        purchaserName: ticket.purchaser_name,
        purchaserEmail: ticket.purchaser_email,
        isValidated: ticket.is_validated,
        qrCodeUrl: ticket.qr_code_url,
        createdAt: ticket.created_at,
        validatedAt: ticket.validated_at,
        event: ticket.event,
        tier: ticket.pricing_tier,
      }));
    } catch (error) {
      console.error("Supabase Service: Error in getTickets:", error);
      throw error;
    }
  },

  getTicketsWithDetails: async (): Promise<
    { data: TicketWithDetails[] | null; error: Error | null }
  > => {
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
      const validData = (data || []).filter((t: any) =>
        t.events && t.pricing_tiers
      );

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
        qrCodeUrl: t.qr_code_url ?? "",
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
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  getTicketWithDetails: async (
    id: string,
  ): Promise<TicketWithDetails | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tickets")
        .select(`
          *,
          event:events (*),
          pricing_tier:pricing_tiers (*)
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
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
        event: data.event,
        tier: data.pricing_tier,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getTicketWithDetails:", error);
      throw error;
    }
  },

  validateTicket: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabaseAdmin
        .from("tickets")
        .update({
          is_validated: true,
          validated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error validating ticket:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Supabase Service: Error in validateTicket:", error);
      return false;
    }
  },

  // Teams
  getTeamById: async (id: string): Promise<Team | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        team_name: data.team_name,
        logo: data.logo,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getTeamById:", error);
      throw error;
    }
  },

  // Subscriptions
  createSubscription: async (subscriptionData: {
    id: string;
    purchaser_name: string;
    purchaser_surname: string;
    purchaser_email: string;
    valid_from: string;
    valid_to: string;
    owner_id: string;
    subscription_type_id: string;
  }): Promise<Subscription> => {
    try {
      // Generate enhanced QR code for subscription
      const enhancedQRCodeUrl = await QRCodeService.updateSubscriptionQRCode({
        id: subscriptionData.id,
        purchaser_name: subscriptionData.purchaser_name,
        purchaser_surname: subscriptionData.purchaser_surname,
        purchaser_email: subscriptionData.purchaser_email,
        valid_from: subscriptionData.valid_from,
        valid_to: subscriptionData.valid_to,
        created_at: new Date().toISOString(),
      });

      const { data, error } = await supabaseAdmin
        .from("user_subscriptions")
        .insert({
          id: subscriptionData.id,
          purchaser_name: subscriptionData.purchaser_name,
          purchaser_surname: subscriptionData.purchaser_surname,
          purchaser_email: subscriptionData.purchaser_email,
          valid_from: subscriptionData.valid_from,
          valid_to: subscriptionData.valid_to,
          owner_id: subscriptionData.owner_id,
          subscription_type_id: subscriptionData.subscription_type_id,
          qr_code_url: enhancedQRCodeUrl,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating subscription:", error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      return {
        id: data.id,
        purchaser_name: data.purchaser_name,
        purchaser_surname: data.purchaser_surname,
        purchaser_email: data.purchaser_email,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        qr_code_url: data.qr_code_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        owner_id: data.owner_id,
        subscription_type_id: data.subscription_type_id,
      };
    } catch (error) {
      console.error("Supabase Service: Error in createSubscription:", error);
      throw error;
    }
  },

  getSubscriptionById: async (id: string): Promise<Subscription | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("user_subscriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        console.error("Error fetching subscription by ID:", error);
        throw new Error(`Failed to fetch subscription: ${error.message}`);
      }

      return {
        id: data.id,
        purchaser_name: data.purchaser_name,
        purchaser_surname: data.purchaser_surname,
        purchaser_email: data.purchaser_email,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        qr_code_url: data.qr_code_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        owner_id: data.owner_id,
        subscription_type_id: data.subscription_type_id,
      };
    } catch (error) {
      console.error("Supabase Service: Error in getSubscriptionById:", error);
      throw error;
    }
  },

  // Email Templates
  getEmailTemplateByName: async (
    name: string,
  ): Promise<EmailTemplate | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("email_templates")
        .select("*")
        .eq("name", name)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        body_html: data.body_html,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error(
        "Supabase Service: Error in getEmailTemplateByName:",
        error,
      );
      throw error;
    }
  },

  // Subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("user_subscriptions")
        .select(`
          *,
          subscription_type:subscription_types(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscriptions:", error);
        throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      }

      return data.map((subscription) => ({
        id: subscription.id,
        purchaser_name: subscription.purchaser_name,
        purchaser_surname: subscription.purchaser_surname,
        purchaser_email: subscription.purchaser_email,
        valid_from: subscription.valid_from,
        valid_to: subscription.valid_to,
        qr_code_url: subscription.qr_code_url,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
        owner_id: subscription.owner_id,
        subscription_type_id: subscription.subscription_type_id,
        subscription_type: subscription.subscription_type
          ? {
            id: subscription.subscription_type.id,
            title: subscription.subscription_type.title,
            description: subscription.subscription_type.description,
            price: subscription.subscription_type.price,
            duration_days: subscription.subscription_type.duration_days,
            features: subscription.subscription_type.features,
            is_active: subscription.subscription_type.is_active,
            created_at: subscription.subscription_type.created_at,
            updated_at: subscription.subscription_type.updated_at,
            corporation_id: subscription.subscription_type.corporation_id,
            created_by: subscription.subscription_type.created_by,
          }
          : undefined,
      }));
    } catch (error) {
      console.error("Supabase Service: Error in getSubscriptions:", error);
      throw error;
    }
  },

  // Teams
  getTeams: async (): Promise<Team[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching teams:", error);
        throw new Error(`Failed to fetch teams: ${error.message}`);
      }

      return data.map((team) => ({
        id: team.id,
        team_name: team.team_name,
        logo: team.logo,
        created_at: team.created_at,
      }));
    } catch (error) {
      console.error("Supabase Service: Error in getTeams:", error);
      throw error;
    }
  },

  // Events with Tiers
  getEventsWithTiers: async (): Promise<EventWithTiers[]> => {
    try {
      const { data: events, error: eventsError } = await supabaseAdmin
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        throw new Error(`Failed to fetch events: ${eventsError.message}`);
      }

      const eventsWithTiers = await Promise.all(
        events.map(async (event) => {
          const { data: pricingTiers } = await supabaseAdmin
            .from("pricing_tiers")
            .select("*")
            .eq("event_id", event.id);

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            team1Id: event.team1_id,
            team2Id: event.team2_id,
            coverImageUrl: event.cover_image_url,
            createdAt: event.created_at,
            updatedAt: event.updated_at,
            pricingTiers: pricingTiers || [],
          };
        }),
      );

      return eventsWithTiers;
    } catch (error) {
      console.error("Supabase Service: Error in getEventsWithTiers:", error);
      throw error;
    }
  },

  // Matches (placeholder - you may need to adjust based on your schema)
  getMatches: async (): Promise<
    { data: any[] | null; error: Error | null }
  > => {
    try {
      // This is a placeholder - adjust based on your actual matches table
      const { data, error } = await supabaseAdmin
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Supabase Service: Error in getMatches:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  // Players (placeholder - you may need to adjust based on your schema)
  getPlayers: async (): Promise<
    { data: any[] | null; error: Error | null }
  > => {
    try {
      // This is a placeholder - adjust based on your actual players table
      const { data, error } = await supabaseAdmin
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Supabase Service: Error in getPlayers:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  // Delete subscription
  deleteSubscription: async (id: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase Service: Error deleting subscription:", error);
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      console.error("Supabase Service: Error in deleteSubscription:", error);
      return {
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  // Delete all subscriptions
  deleteAllSubscriptions: async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except dummy ID

      if (error) {
        console.error(
          "Supabase Service: Error deleting all subscriptions:",
          error,
        );
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      console.error(
        "Supabase Service: Error in deleteAllSubscriptions:",
        error,
      );
      return {
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  },

  // Get fans data
  getFans: async (): Promise<Fan[]> => {
    try {
      // Get all tickets with purchaser information
      const { data: tickets, error: ticketsError } = await supabaseAdmin
        .from("tickets")
        .select(`
          purchaser_name,
          purchaser_email,
          pricing_tier:pricing_tiers(price)
        `);

      if (ticketsError) {
        console.error("Error fetching tickets for fans:", ticketsError);
        throw new Error(`Failed to fetch tickets: ${ticketsError.message}`);
      }

      // Get all subscriptions
      const { data: subscriptions, error: subscriptionsError } =
        await supabaseAdmin
          .from("subscriptions")
          .select("purchaser_email, valid_to");

      if (subscriptionsError) {
        console.error(
          "Error fetching subscriptions for fans:",
          subscriptionsError,
        );
        throw new Error(
          `Failed to fetch subscriptions: ${subscriptionsError.message}`,
        );
      }

      // Group tickets by purchaser
      const fanMap = new Map<string, Fan>();

      // Process tickets
      tickets?.forEach((ticket) => {
        const email = ticket.purchaser_email;
        const name = ticket.purchaser_name || "Nenurodyta";
        const price = (ticket.pricing_tier as any)?.price || 0;

        if (fanMap.has(email)) {
          const fan = fanMap.get(email)!;
          fan.total_tickets += 1;
          fan.money_spent += price;
        } else {
          fanMap.set(email, {
            name,
            email,
            total_tickets: 1,
            money_spent: price,
            has_valid_subscription: false, // Will be updated below
          });
        }
      });

      // Process subscriptions to check validity
      const now = new Date();
      subscriptions?.forEach((subscription) => {
        const email = subscription.purchaser_email;
        const isValid = new Date(subscription.valid_to) > now;

        if (fanMap.has(email)) {
          const fan = fanMap.get(email)!;
          fan.has_valid_subscription = isValid;
        } else {
          // Create fan entry for subscription-only users
          fanMap.set(email, {
            name: "Prenumeratos vartotojas",
            email,
            total_tickets: 0,
            money_spent: 0,
            has_valid_subscription: isValid,
          });
        }
      });

      return Array.from(fanMap.values());
    } catch (error) {
      console.error("Supabase Service: Error in getFans:", error);
      throw error;
    }
  },

  // Register user with corporation
  registerUserWithCorporation: async (data: {
    userId: string;
    email: string;
    name: string;
    organizationName: string;
  }): Promise<{ userId: string; corporationId: string }> => {
    try {
      // Create corporation
      const { data: corporation, error: corpError } = await supabaseAdmin
        .from("teams")
        .insert({
          team_name: data.organizationName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (corpError) {
        console.error("Error creating corporation:", corpError);
        throw new Error(`Failed to create corporation: ${corpError.message}`);
      }

      // Update user profile with corporation info
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: data.userId,
          email: data.email,
          full_name: data.name,
          team_id: corporation.id,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Error updating user profile:", profileError);
        throw new Error(
          `Failed to update user profile: ${profileError.message}`,
        );
      }

      return {
        userId: data.userId,
        corporationId: corporation.id,
      };
    } catch (error) {
      console.error(
        "Supabase Service: Error in registerUserWithCorporation:",
        error,
      );
      throw error;
    }
  },

  // Subscription Types Management
  createSubscriptionType: async (subscriptionTypeData: {
    title: string;
    description?: string | null;
    price: number;
    duration_days: number;
    features: string[];
    is_active: boolean;
  }): Promise<SubscriptionType> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_types")
        .insert({
          title: subscriptionTypeData.title,
          description: subscriptionTypeData.description,
          price: subscriptionTypeData.price,
          duration_days: subscriptionTypeData.duration_days,
          features: subscriptionTypeData.features,
          is_active: subscriptionTypeData.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating subscription type:", error);
        throw new Error(`Failed to create subscription type: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        duration_days: data.duration_days,
        features: data.features,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by,
      };
    } catch (error) {
      console.error(
        "Supabase Service: Error in createSubscriptionType:",
        error,
      );
      throw error;
    }
  },

  getSubscriptionTypes: async (): Promise<SubscriptionType[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_types")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscription types:", error);
        throw new Error(`Failed to fetch subscription types: ${error.message}`);
      }

      return data.map((subscriptionType) => ({
        id: subscriptionType.id,
        title: subscriptionType.title,
        description: subscriptionType.description,
        price: subscriptionType.price,
        duration_days: subscriptionType.duration_days,
        features: subscriptionType.features,
        is_active: subscriptionType.is_active,
        created_at: subscriptionType.created_at,
        updated_at: subscriptionType.updated_at,
        created_by: subscriptionType.created_by,
      }));
    } catch (error) {
      console.error("Supabase Service: Error in getSubscriptionTypes:", error);
      throw error;
    }
  },

  updateSubscriptionType: async (
    id: string,
    subscriptionTypeData: {
      title: string;
      description?: string | null;
      price: number;
      duration_days: number;
      features: string[];
      is_active: boolean;
    },
  ): Promise<SubscriptionType> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscription_types")
        .update({
          title: subscriptionTypeData.title,
          description: subscriptionTypeData.description,
          price: subscriptionTypeData.price,
          duration_days: subscriptionTypeData.duration_days,
          features: subscriptionTypeData.features,
          is_active: subscriptionTypeData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating subscription type:", error);
        throw new Error(`Failed to update subscription type: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        duration_days: data.duration_days,
        features: data.features,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by,
      };
    } catch (error) {
      console.error(
        "Supabase Service: Error in updateSubscriptionType:",
        error,
      );
      throw error;
    }
  },

  deleteSubscriptionType: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabaseAdmin
        .from("subscription_types")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting subscription type:", error);
        throw new Error(`Failed to delete subscription type: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error(
        "Supabase Service: Error in deleteSubscriptionType:",
        error,
      );
      throw error;
    }
  },

  // Shop Orders
  getShopOrderById: async (orderId: string): Promise<any> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("shop_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching shop order:", error);
        throw new Error(`Failed to fetch shop order: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Supabase Service: Error in getShopOrderById:", error);
      throw error;
    }
  },

  getShopOrderItems: async (orderId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("shop_order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching shop order items:", error);
        throw new Error(`Failed to fetch shop order items: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Supabase Service: Error in getShopOrderItems:", error);
      throw error;
    }
  },
};
