import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test the connection with better error handling
export async function testSupabaseConnection() {
  try {
    // First test: check if we can connect and if auth is working
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession()

    if (authError) {
      console.error("Supabase auth error:", authError.message)
      return false
    }

    // Then test database access
    const { error: dbError } = await supabase
      .from("events")
      .select("id")
      .limit(1)
    
    if (dbError) {
      // If it's a permissions error (PGRST301), that's actually okay - it means we're connected
      if (dbError.code === "PGRST301") {
        console.log("Supabase connected (with expected permissions error)")
        return true
      }
      
      console.error("Supabase database error:", dbError.message)
      return false
    }

    console.log("Supabase connection successful")
    return true
  } catch (error) {
    console.error("Supabase connection error:", error)
    return false
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name?: string
          surname?: string
          phone?: string
          role: "user" | "admin"
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string
          surname?: string
          phone?: string
          role?: "user" | "admin"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          surname?: string
          phone?: string
          role?: "user" | "admin"
        }
      }
      events: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          description?: string
          date?: string
          time?: string
          location?: string
          team1_id?: string
          team2_id?: string
          cover_image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          location?: string
          team1_id?: string
          team2_id?: string
          cover_image_url?: string
          updated_at?: string
        }
      }
      pricing_tiers: {
        Row: {
          id: string
          event_id: string
          name: string
          price: number
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          price: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          price?: number
          quantity?: number
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          tier_id: string
          user_id?: string
          purchaser_name?: string
          status?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          tier_id: string
          user_id?: string
          purchaser_name?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          tier_id?: string
          user_id?: string
          purchaser_name?: string
          status?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface Ticket {
  id: string
  event_id: string
  tier_id: string
  user_id?: string
  purchaser_name?: string
  status?: string
  created_at: string
  updated_at: string
}

export interface CreateTicketInput {
  event_id: string
  tier_id: string
  purchaser_name?: string
  user_id?: string
}

export interface UpdateTicketInput {
  event_id?: string
  tier_id?: string
  user_id?: string
  purchaser_name?: string
  status?: string
}
