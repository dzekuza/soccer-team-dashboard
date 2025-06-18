// Base types
export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  createdAt: string
  updatedAt: string
  team1Id?: string
  team2Id?: string
  coverImageUrl?: string
}

export interface PricingTier {
  id: string
  eventId: string
  name: string
  price: number
  maxQuantity: number
  soldQuantity: number
}

export interface Ticket {
  id: string
  event_id: string
  tier_id: string
  purchaser_name: string
  purchaser_email: string
  is_validated: boolean
  created_at: string
  validated_at: string | null
  qr_code_url: string
  event_cover_image_url?: string
  event_date?: string
  event_title?: string
  event_description?: string
  event_location?: string
  event_time?: string
  team1_id?: string
  team2_id?: string
  pdf_url?: string
}

// Extended types for API responses
export interface EventWithTiers extends Event {
  pricingTiers: PricingTier[]
}

export interface TicketWithDetails extends Ticket {
  event: Event
  tier: PricingTier
}

export interface EventStats {
  totalEvents: number
  totalTickets: number
  validatedTickets: number
  totalRevenue: number
}

export interface Team {
  id: string
  team_name: string
  logo: string
  created_at?: string
}

export interface Subscription {
  id: string
  title: string
  description?: string
  price: number
  durationDays: number
  createdAt: string
}

export interface UserSubscription {
  id: string
  userId: string
  subscriptionId: string
  purchaseDate: string
  expiresAt?: string
  assignedBy?: string
  createdAt: string
  // Optionally, include joined subscription info
  subscription?: Subscription
}
