import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import type {
  EmailTemplate,
  Event,
  EventWithTiers,
  PricingTier,
  Subscription,
  Team,
  Ticket,
  TicketWithDetails,
} from "./types";
import { QRCodeService } from "./qr-code-service";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
        .from("subscriptions")
        .insert({
          id: subscriptionData.id,
          purchaser_name: subscriptionData.purchaser_name,
          purchaser_surname: subscriptionData.purchaser_surname,
          purchaser_email: subscriptionData.purchaser_email,
          valid_from: subscriptionData.valid_from,
          valid_to: subscriptionData.valid_to,
          owner_id: subscriptionData.owner_id,
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
      };
    } catch (error) {
      console.error("Supabase Service: Error in createSubscription:", error);
      throw error;
    }
  },

  getSubscriptionById: async (id: string): Promise<Subscription | null> => {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
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
};
