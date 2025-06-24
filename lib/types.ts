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
  team1?: Team
  team2?: Team
  pricingTiers?: PricingTier[]
}

export interface PricingTier {
  id: string
  eventId: string
  name: string
  price: number
  quantity: number
  soldQuantity: number
  description?: string
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
  status?: "pending" | "paid" | "cancelled" // Added for ticket status
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

// Type for the simplified ticket list view
export interface TicketListItem {
  id: string;
  purchaserName: string | null;
  purchaserEmail: string | null;
  isValidated: boolean;
  createdAt: string;
  event: {
    title: string;
    date: string;
  };
  tier: {
    name: string;
    price: number;
  };
}

export interface EventStats {
  totalTickets: number;
  ticketsScanned: number;
  revenue: number;
  totalEvents: number;
  validatedTickets: number;
  totalRevenue: number;
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

export interface RecentActivity {
  type: 'event_created' | 'ticket_generated' | 'ticket_validated';
  title: string;
  timestamp: string;
  details: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  created_at: string;
  updated_at: string;
}

export interface Fan {
  email: string;
  name: string;
  total_tickets: number;
  money_spent: number;
  has_valid_subscription: boolean;
}

export interface MarketingCampaign {
  id: string;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  created_at: string;
  recipient_count: number;
}

export interface Match {
  team_key: string;
  match_date: string | null;
  match_time: string | null;
  team1: string | null;
  team2: string | null;
  team1_score: number | null;
  team2_score: number | null;
  team1_logo: string | null;
  team2_logo: string | null;
  venue: string | null;
  match_group: string | null;
  fingerprint: string;
  lff_url_slug: string | null;
  status: string | null;
  home_shots_total: number | null;
  away_shots_total: number | null;
  home_shots_on_target: number | null;
  away_shots_on_target: number | null;
  home_shots_off_target: number | null;
  away_shots_off_target: number | null;
  home_attacks: number | null;
  away_attacks: number | null;
  home_dangerous_attacks: number | null;
  away_dangerous_attacks: number | null;
  home_corners: number | null;
  away_corners: number | null;
  owner_id?: string;
  inserted_at?: string;
}

export interface Player {
  id: number;
  number: string | null;
  name?: string | null;
  profile_url?: string | null;
  position?: string | null;
  matches?: number | null;
  minutes?: number | null;
  goals?: number | null;
  assists?: number | null;
  yellow_cards?: number | null;
  red_cards?: number | null;
  image_url?: string | null;
  inserted_at?: string;
  fingerprint?: string | null;
  name_first?: string | null;
  name_last?: string | null;
  team_key?: "BANGA A" | "BANGA B" | "BANGA M" | null;
}
