"use client"

import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { Database } from "@/lib/types"

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createClient())
  
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  )
} 