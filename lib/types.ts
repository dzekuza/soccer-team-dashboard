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
  quantity: number
  soldQuantity: number
}

export interface Ticket {
  id: string
  eventId: string
  tierId: string
  purchaserName: string
  purchaserSurname?: string
  purchaserEmail: string
  isValidated: boolean
  createdAt: string
  validatedAt: string | null
  qrCodeUrl: string // Added QR code URL
  userId?: string // Added for user assignment
  eventCoverImageUrl?: string // Added for event cover image from covers bucket
  eventDate?: string // Added for event date assigned to ticket
  eventTitle?: string // Added for event title
  eventDescription?: string // Added for event description
  eventLocation?: string // Added for event location
  eventTime?: string // Added for event time
  team1Id?: string // Added for team1
  team2Id?: string // Added for team2
  teamId?: string // Added for legacy team_id column
  pdfUrl?: string // Added for ticket PDF public URL
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
  createdAt: string
  updatedAt: string
  purchaser_name: string | null
  purchaser_surname: string | null
  purchaser_email: string | null
  valid_from: string
  valid_to: string
  qr_code_url: string | null
  owner_id: string
}

export type UserSubscription = Subscription;
