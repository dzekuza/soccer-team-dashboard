import { supabase } from './supabase'
import { Event, EventStats, EventWithTiers, PricingTier, Subscription, Team, Ticket, TicketWithDetails, User, UserSubscription } from './types'
import { SupabaseClient } from '@supabase/supabase-js'

export const dbService = {
  // User management
  getUser: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  },

  // Event management
  createEvent: async (
    event: Omit<Event, 'id' | 'created_at' | 'updated_at'>,
    pricingTiers: Array<{ name: string; price: number; maxQuantity: number }>,
    client: SupabaseClient = supabase
  ): Promise<EventWithTiers | null> => {
    try {
      // Start a transaction
      const { data: eventData, error: eventError } = await client
        .from('events')
        .insert([{
          ...event,
          team1_id: event.team1Id,
          team2_id: event.team2Id,
          cover_image_url: event.coverImageUrl
        }])
        .select()
        .single()

      if (eventError) {
        console.error('Error creating event:', eventError)
        return null
      }

      // Create pricing tiers for the event
      const tiersToCreate = pricingTiers.map(tier => ({
        event_id: eventData.id,
        name: tier.name,
        price: tier.price,
        quantity: tier.maxQuantity
      }))

      const { data: tiersData, error: tiersError } = await client
        .from('pricing_tiers')
        .insert(tiersToCreate)
        .select()

      if (tiersError) {
        console.error('Error creating pricing tiers:', tiersError)
        // Delete the event since pricing tiers failed
        await client.from('events').delete().eq('id', eventData.id)
        return null
      }

      return {
        ...eventData,
        pricing_tiers: tiersData
      }
    } catch (error) {
      console.error('Error in createEvent:', error)
      return null
    }
  },

  getEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }

    return data
  },

  getEventsWithTiers: async (): Promise<EventWithTiers[]> => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        pricing_tiers (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events with tiers:', error)
      return []
    }

    return data
  },

  getEventWithTiers: async (id: string): Promise<EventWithTiers | null> => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        pricing_tiers (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching event with tiers:', error)
      return null
    }

    return data
  },

  // Pricing tier management
  getPricingTiers: async (eventId: string): Promise<PricingTier[]> => {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('event_id', eventId)

    if (error) {
      console.error('Error fetching pricing tiers:', error)
      return []
    }

    return data
  },

  getPricingTier: async (id: string): Promise<PricingTier | null> => {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching pricing tier:', error)
      return null
    }

    return data
  },

  // Team management
  getTeamById: async (id: string): Promise<Team | null> => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return null
    }

    return data
  },

  // Ticket management
  createTicket: async (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket | null> => {
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticket])
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return null
    }

    return data
  },

  updateTicket: async (id: string, updates: Partial<Ticket>): Promise<Ticket | null> => {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return null
    }

    return data
  },

  getTicketWithDetails: async (id: string): Promise<TicketWithDetails | null> => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events (*),
        pricing_tier:pricing_tiers (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket with details:', error)
      throw error;
    }

    return data as unknown as TicketWithDetails
  },

  getTicketsWithDetails: async (): Promise<TicketWithDetails[]> => {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        event:events (*),
        pricing_tier:pricing_tiers (*)
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets with details:', error)
      throw error
    }

    return data
  },

  // Subscriber management
  getAllSubscriberEmails: async () => {
    const { data, error } = await supabase
      .from('subscribers')
      .select('email, name')

    if (error) {
      console.error('Error fetching subscribers:', error)
      return []
    }

    return data
  },

  // Stats
  getEventStats: async (corporation_id: string): Promise<EventStats> => {
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('corporation_id', corporation_id);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return {
        totalEvents: 0,
        totalTickets: 0,
        validatedTickets: 0,
        totalRevenue: 0,
        ticketsScanned: 0,
        revenue: 0
      };
    }

    const eventIds = events.map(e => e.id);

    // Get tickets for these events
    type TicketWithPricingTier = {
      id: string;
      status: string;
      pricing_tier: {
        price: number;
      };
    };

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id,
        status,
        pricing_tier:pricing_tier_id (
          price
        )
      `)
      .in('event_id', eventIds) as { data: TicketWithPricingTier[] | null, error: any };

    if (ticketsError || !tickets) {
      console.error('Error fetching tickets:', ticketsError);
      return {
        totalEvents: events.length,
        totalTickets: 0,
        validatedTickets: 0,
        totalRevenue: 0,
        ticketsScanned: 0,
        revenue: 0
      };
    }

    const validatedTickets = tickets.filter(t => t.status === 'validated').length;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.pricing_tier?.price || 0), 0);

    return {
      totalEvents: events.length,
      totalTickets: tickets.length,
      validatedTickets,
      totalRevenue,
      ticketsScanned: validatedTickets,
      revenue: totalRevenue
    };
  },

  // Ticket validation
  validateTicket: async (ticketId: string): Promise<{ success: boolean; ticket?: TicketWithDetails }> => {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({ 
          is_validated: true, 
          validated_at: new Date().toISOString() 
        })
        .eq('id', ticketId)
        .select(`
          *,
          event:events (*),
          pricing_tier:pricing_tiers (*)
        `)
        .single();

      if (error) {
        console.error('Error validating ticket:', error);
        return { success: false };
      }

      return { 
        success: true, 
        ticket: ticket as TicketWithDetails 
      };
    } catch (error) {
      console.error('Error in validateTicket:', error);
      return { success: false };
    }
  }
}
