// Base types
export interface Corporation {
  id: string
  name: string
  created_at: string
  owner_id?: string
}

export interface User {
  id: string
  email: string
  name?: string
  surname?: string
  phone?: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Team {
  id: string
  team_name: string
  logo?: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  date?: string
  time?: string
  location?: string
  team1_id?: string
  team2_id?: string
  cover_image_url?: string
  created_at: string
  updated_at: string
}

export interface PricingTier {
  id: string
  event_id: string
  name: string
  price: number
  quantity: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string;
  created_at: string;
  updated_at: string;
  purchaser_name?: string;
  purchaser_surname?: string;
  purchaser_email?: string;
  valid_from: string;
  valid_to: string;
  qr_code_url?: string;
  owner_id: string;
}

export interface Ticket {
  id: string
  event_id: string
  tier_id: string
  purchaser_name?: string
  purchaser_surname?: string
  purchaser_email?: string
  status: 'pending' | 'valid' | 'validated' | 'cancelled'
  qr_code_url?: string
  created_at: string
  updated_at: string
}

// Extended types for API responses
export interface EventWithTiers extends Event {
  pricing_tiers: PricingTier[]
}

export interface TicketWithDetails extends Ticket {
  events: Event
  pricing_tiers: PricingTier
}

export interface RecentActivity {
  type: 'event_created' | 'ticket_generated' | 'ticket_validated';
  title: string;
  timestamp: string;
  details: string;
}

export interface EventStats {
  totalEvents: number
  totalTickets: number
  validatedTickets: number
  totalRevenue: number
}

export interface CreateEventInput {
  title: string
  description?: string
  date?: string
  time?: string
  location?: string
  team1_id?: string
  team2_id?: string
  cover_image_url?: string
  pricing_tiers: {
    name: string
    price: number
    quantity: number
  }[]
}

export interface CreateTicketInput {
  event_id: string
  tier_id: string
  purchaser_name?: string
  user_id?: string
}

export type Database = {
  public: {
    Tables: {
      events: {
        Row: Event
      },
      pricing_tiers: {
        Row: PricingTier
      },
      tickets: {
        Row: Ticket
      },
      users: {
        Row: User
      },
      teams: {
        Row: Team
      }
    }
  }
}
