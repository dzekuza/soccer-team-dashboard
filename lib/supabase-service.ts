import { supabase } from './supabase'
import { Event, EventWithTiers, PricingTier, Subscription, Ticket, TicketWithDetails, User, UserSubscription, Team, EventStats } from './types'

export const supabaseService = {
  // User management
  getUser: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, surname, phone, role, created_at')
      .eq('id', id)
        .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  },

  // Event management
  getEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, date, time, location, team1_id, team2_id, cover_image_url, created_at, updated_at')
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
      .select('*, pricing_tiers (*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events with tiers:', error)
      return []
    }

    return data
  },

  getEvent: async (id: string): Promise<Event | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

      if (error) {
      console.error('Error fetching event:', error)
      return null
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

  createEvent: async (
    event: Omit<Event, 'id' | 'created_at' | 'updated_at'>,
    pricingTiers: { name: string; price: number; maxQuantity: number }[],
    supabaseClient = supabase
  ): Promise<Event | null> => {
    // Create event
    const { data: eventData, error: eventError } = await supabaseClient
      .from('events')
      .insert([event])
      .select()
      .single()

    if (eventError || !eventData) {
      console.error('Error creating event:', eventError)
      return null
    }

    // Create pricing tiers
    const tiersToCreate = pricingTiers.map(tier => ({
      event_id: eventData.id,
        name: tier.name,
        price: tier.price,
      quantity: tier.maxQuantity
    }))

    const { error: tiersError } = await supabaseClient
      .from('pricing_tiers')
      .insert(tiersToCreate)

    if (tiersError) {
      console.error('Error creating pricing tiers:', tiersError)
      // We don't return null here because the event was created successfully
    }

    return eventData
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

  createPricingTier: async (tier: Omit<PricingTier, 'id' | 'created_at' | 'updated_at'>): Promise<PricingTier | null> => {
    const { data, error } = await supabase
      .from('pricing_tiers')
      .insert([tier])
          .select()
      .single()

    if (error) {
      console.error('Error creating pricing tier:', error)
      return null
      }

    return data
  },

  // Ticket management
  getTickets: async (): Promise<Ticket[]> => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

      if (error) {
      console.error('Error fetching tickets:', error)
      return []
    }

    return data
  },

  getTicketsWithDetails: async (): Promise<TicketWithDetails[]> => {
      const { data, error } = await supabase
      .from('tickets')
        .select(`
          *,
          events(*),
          pricing_tiers(*)
        `)
      .order('created_at', { ascending: false });

      if (error) {
      console.error('Error fetching tickets with details:', error);
      return [];
    }

    return data as unknown as TicketWithDetails[];
  },

  getTicket: async (id: string): Promise<Ticket | null> => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

      if (error) {
      console.error('Error fetching ticket:', error)
      return null
    }

    return data
  },

  getTicketWithDetails: async (id: string): Promise<TicketWithDetails | null> => {
      const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events(*),
        pricing_tiers(*)
      `)
      .eq('id', id)
      .single()

      if (error) {
      console.error('Error fetching ticket with details:', error)
      return null
    }

    return data as unknown as TicketWithDetails | null;
  },

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

  validateTicket: async (id: string): Promise<{ success: boolean; ticket?: TicketWithDetails }> => {
    const ticket = await supabaseService.getTicketWithDetails(id)
    if (!ticket) {
      return { success: false }
    }

    const { error } = await supabase
      .from('tickets')
      .update({ status: 'validated' })
      .eq('id', id)

    if (error) {
      console.error('Error validating ticket:', error)
      return { success: false }
    }

    const updatedTicket = await supabaseService.getTicketWithDetails(id)
    return { success: true, ticket: updatedTicket! }
  },

  // Subscription management
  getSubscriptions: async (): Promise<Subscription[]> => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return []
    }

    return data
  },

  createSubscription: async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription | null> => {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }

    return data
  },

  // User subscription management
  getUserSubscriptions: async (userId: string): Promise<UserSubscription[]> => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user subscriptions:', error)
      return []
    }

    return data
  },

  assignSubscriptionToUser: async (subscription: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<UserSubscription | null> => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscription])
      .select()
      .single()

    if (error) {
      console.error('Error assigning subscription to user:', error)
      return null
    }

    return data
  },

  // Analytics
  getEventStats: async () => {
    const [eventsCount, ticketsCount, validatedTicketsCount, ticketsWithPrices] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('tickets').select('id', { count: 'exact', head: true }),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'validated'),
      supabase.from('tickets').select('pricing_tiers!inner(price)'),
    ])

    const totalEvents = eventsCount.count || 0
    const totalTickets = ticketsCount.count || 0
    const validatedTickets = validatedTicketsCount.count || 0

    let totalRevenue = 0
    if (ticketsWithPrices.data) {
      totalRevenue = ticketsWithPrices.data.reduce((sum, ticket) => {
        if (ticket.pricing_tiers && Array.isArray(ticket.pricing_tiers)) {
          const price = ticket.pricing_tiers[0]?.price || 0
          return sum + price
        }
        return sum
      }, 0)
    }

    return {
      totalEvents,
      totalTickets,
      validatedTickets,
      totalRevenue,
    }
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

  registerUserWithCorporation: async (data: {
    userId: string;
    email: string;
    name: string;
    organizationName: string;
  }): Promise<{ userId: string; corporationId: string }> => {
    // Create corporation
    const { data: corporation, error: corpError } = await supabase
      .from('corporations')
      .insert([{ name: data.organizationName }])
      .select()
      .single();

    if (corpError) {
      throw new Error(`Failed to create corporation: ${corpError.message}`);
    }

    // Update user with corporation_id and other details
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        name: data.name,
        email: data.email,
        role: 'admin',
        corporation_id: corporation.id
      })
      .eq('id', data.userId)
      .select()
      .single();

    if (userError) {
      // Rollback corporation creation
      await supabase.from('corporations').delete().eq('id', corporation.id);
      throw new Error(`Failed to update user: ${userError.message}`);
    }

    return {
      userId: user.id,
      corporationId: corporation.id
    };
  },

  // Team management
  getTeams: async (): Promise<Team[]> => {
    const { data, error } = await supabase.from('teams').select('*')
    if (error) {
      console.error('Error fetching teams:', error)
      return []
    }
    return data
  },
}
