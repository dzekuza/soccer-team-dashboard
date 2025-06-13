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
