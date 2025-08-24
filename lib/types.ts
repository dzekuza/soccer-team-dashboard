// Base types
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  corporation_id?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  team1Id?: string;
  team2Id?: string;
  coverImageUrl?: string;
  team1?: Team;
  team2?: Team;
  pricingTiers?: PricingTier[];
}

export interface PricingTier {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  soldQuantity: number;
  description?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  tierId: string;
  purchaserName: string;
  purchaserSurname?: string;
  purchaserEmail: string;
  isValidated: boolean;
  createdAt: string;
  validatedAt: string | null;
  qrCodeUrl: string; // Added QR code URL
  userId?: string; // Optional - column was removed from schema
  status?: "pending" | "paid" | "cancelled"; // Added for ticket status
  eventCoverImageUrl?: string; // Added for event cover image from covers bucket
  eventDate?: string; // Added for event date assigned to ticket
  eventTitle?: string; // Added for event title
  eventDescription?: string; // Added for event description
  eventLocation?: string; // Added for event location
  eventTime?: string; // Added for event time
  team1Id?: string; // Added for team1
  team2Id?: string; // Added for team2
  teamId?: string; // Added for legacy team_id column
  pdfUrl?: string; // Added for ticket PDF public URL
}

// Extended types for API responses
export interface EventWithTiers extends Event {
  pricingTiers: PricingTier[];
}

export interface TicketWithDetails extends Ticket {
  event: Event;
  tier: PricingTier;
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
  id: string;
  team_name: string;
  logo: string;
  created_at?: string;
}

export interface Subscription {
  id: string;
  createdAt: string;
  updatedAt: string;
  purchaser_name: string | null;
  purchaser_surname: string | null;
  purchaser_email: string | null;
  valid_from: string;
  valid_to: string;
  qr_code_url: string | null;
  owner_id: string;
  user_id?: string;
  subscription_type_id: string;
  status?: "active" | "expired" | "cancelled";
  purchase_date?: string;
  assigned_by?: string;
  corporation_id?: string;
  subscription_type?: SubscriptionType;
}

export interface SubscriptionType {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type UserSubscription = Subscription;

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  features?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentActivity {
  type: "event_created" | "ticket_generated" | "ticket_validated";
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
  id: string;
  number: string | null;
  name?: string | null;
  surname?: string | null;
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

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          created_at: string;
          updated_at: string;
          team1_id?: string;
          team2_id?: string;
          cover_image_url?: string;
          corporation_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          created_at?: string;
          updated_at?: string;
          team1_id?: string;
          team2_id?: string;
          cover_image_url?: string;
          corporation_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
          team1_id?: string;
          team2_id?: string;
          cover_image_url?: string;
          corporation_id?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          event_id: string;
          tier_id: string;
          purchaser_name: string;
          purchaser_surname?: string;
          purchaser_email: string;
          is_validated: boolean;
          created_at: string;
          validated_at: string | null;
          qr_code_url: string;
          status?: string;
          event_cover_image_url?: string;
          event_date?: string;
          event_title?: string;
          event_description?: string;
          event_location?: string;
          event_time?: string;
          team1_id?: string;
          team2_id?: string;
          team_id?: string;
          pdf_url?: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          tier_id: string;
          purchaser_name: string;
          purchaser_surname?: string;
          purchaser_email: string;
          is_validated?: boolean;
          created_at?: string;
          validated_at?: string | null;
          qr_code_url: string;
          status?: string;
          event_cover_image_url?: string;
          event_date?: string;
          event_title?: string;
          event_description?: string;
          event_location?: string;
          event_time?: string;
          team1_id?: string;
          team2_id?: string;
          team_id?: string;
          pdf_url?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          tier_id?: string;
          purchaser_name?: string;
          purchaser_surname?: string;
          purchaser_email?: string;
          is_validated?: boolean;
          created_at?: string;
          validated_at?: string | null;
          qr_code_url?: string;
          status?: string;
          event_cover_image_url?: string;
          event_date?: string;
          event_title?: string;
          event_description?: string;
          event_location?: string;
          event_time?: string;
          team1_id?: string;
          team2_id?: string;
          team_id?: string;
          pdf_url?: string;
        };
      };
      pricing_tiers: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          price: number;
          quantity: number;
          sold_quantity: number;
          description?: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          price: number;
          quantity: number;
          sold_quantity?: number;
          description?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          price?: number;
          quantity?: number;
          sold_quantity?: number;
          description?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          role?: string;
          corporation_id?: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          role?: string;
          corporation_id?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          role?: string;
          corporation_id?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description?: string;
          image_url?: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      product_attributes: {
        Row: {
          id: string;
          name: string;
          type: string;
          options?: any;
          is_required: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          options?: any;
          is_required?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          options?: any;
          is_required?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          short_description?: string;
          price: number;
          compare_price?: number;
          cost_price?: number;
          sku?: string;
          barcode?: string;
          category_id?: string;
          image_url?: string;
          gallery_urls?: string[];
          is_active: boolean;
          is_featured: boolean;
          weight_grams?: number;
          dimensions?: any;
          stock_quantity: number;
          low_stock_threshold: number;
          allow_backorders: boolean;
          max_order_quantity?: number;
          min_order_quantity: number;
          tags?: string[];
          seo_title?: string;
          seo_description?: string;
          seo_keywords?: string[];
          created_at: string;
          updated_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          short_description?: string;
          price: number;
          compare_price?: number;
          cost_price?: number;
          sku?: string;
          barcode?: string;
          category_id?: string;
          image_url?: string;
          gallery_urls?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          weight_grams?: number;
          dimensions?: any;
          stock_quantity?: number;
          low_stock_threshold?: number;
          allow_backorders?: boolean;
          max_order_quantity?: number;
          min_order_quantity?: number;
          tags?: string[];
          seo_title?: string;
          seo_description?: string;
          seo_keywords?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          short_description?: string;
          price?: number;
          compare_price?: number;
          cost_price?: number;
          sku?: string;
          barcode?: string;
          category_id?: string;
          image_url?: string;
          gallery_urls?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          weight_grams?: number;
          dimensions?: any;
          stock_quantity?: number;
          low_stock_threshold?: number;
          allow_backorders?: boolean;
          max_order_quantity?: number;
          min_order_quantity?: number;
          tags?: string[];
          seo_title?: string;
          seo_description?: string;
          seo_keywords?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku?: string;
          barcode?: string;
          price?: number;
          compare_price?: number;
          cost_price?: number;
          stock_quantity: number;
          weight_grams?: number;
          dimensions?: any;
          image_url?: string;
          attributes: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku?: string;
          barcode?: string;
          price?: number;
          compare_price?: number;
          cost_price?: number;
          stock_quantity?: number;
          weight_grams?: number;
          dimensions?: any;
          image_url?: string;
          attributes: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          barcode?: string;
          price?: number;
          compare_price?: number;
          cost_price?: number;
          stock_quantity?: number;
          weight_grams?: number;
          dimensions?: any;
          image_url?: string;
          attributes?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      product_attribute_values: {
        Row: {
          id: string;
          product_id: string;
          attribute_id: string;
          value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          attribute_id: string;
          value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          attribute_id?: string;
          value?: string;
          created_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          product_id?: string;
          variant_id?: string;
          type: string;
          quantity: number;
          previous_quantity: number;
          new_quantity: number;
          reference?: string;
          notes?: string;
          created_at: string;
          created_by?: string;
        };
        Insert: {
          id?: string;
          product_id?: string;
          variant_id?: string;
          type: string;
          quantity: number;
          previous_quantity: number;
          new_quantity: number;
          reference?: string;
          notes?: string;
          created_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string;
          type?: string;
          quantity?: number;
          previous_quantity?: number;
          new_quantity?: number;
          reference?: string;
          notes?: string;
          created_at?: string;
          created_by?: string;
        };
      };
    };
  };
}
