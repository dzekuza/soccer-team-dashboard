import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ewyzkaldsbwzdwyhepbi.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eXprYWxkc2J3emR3eWhlcGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTEzNzUsImV4cCI6MjA2NTMyNzM3NX0.jz7VDe4anJaXg9HZKOKbIEzj8wvZT08gV1YngE4HIXI"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable auth for now since we're using custom auth
  },
})

// Test the connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("events").select("count", { count: "exact", head: true })
    if (error) {
      console.error("Supabase connection test failed:", error)
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
          name: string
          password: string
          role: "admin" | "staff"
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password: string
          role?: "admin" | "staff"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password?: string
          role?: "admin" | "staff"
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time: string
          location: string
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
          updated_at?: string
        }
      }
      pricing_tiers: {
        Row: {
          id: string
          event_id: string
          name: string
          price: number
          max_quantity: number
          sold_quantity: number
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          price: number
          max_quantity: number
          sold_quantity?: number
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          price?: number
          max_quantity?: number
          sold_quantity?: number
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          tier_id: string
          purchaser_name: string
          purchaser_email: string
          is_validated: boolean
          created_at: string
          validated_at: string | null
          qr_code_url: string
        }
        Insert: {
          id?: string
          event_id: string
          tier_id: string
          purchaser_name: string
          purchaser_email: string
          is_validated?: boolean
          created_at?: string
          validated_at?: string | null
          qr_code_url: string
        }
        Update: {
          id?: string
          event_id?: string
          tier_id?: string
          purchaser_name?: string
          purchaser_email?: string
          is_validated?: boolean
          validated_at?: string | null
          qr_code_url?: string
        }
      }
    }
  }
}
