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
  eventId: string
  tierId: string
  purchaserName: string
  purchaserEmail: string
  isValidated: boolean
  createdAt: string
  validatedAt: string | null
  qrCodeUrl: string // Added QR code URL
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
  fingerprint?: number
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
