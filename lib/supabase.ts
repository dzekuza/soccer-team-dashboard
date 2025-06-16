import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Anon Key:", supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
