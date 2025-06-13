"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "staff"
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on initial render (for demo purposes)
  useEffect(() => {
    // For demo purposes, we'll still use localStorage for auth
    // In production, you'd use Supabase Auth
    const currentUserStr = localStorage.getItem("soccer_dashboard_current_user")
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr)
        setUser(currentUser)
      } catch (error) {
        console.error("Error parsing current user:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Attempting login for:", email)

    try {
      // Check if user exists in Supabase
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password) // In production, use proper password hashing
        .single()

      if (error || !users) {
        console.log("Login failed for:", email)
        return false
      }

      const foundUser: User = {
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
      }

      console.log("Login successful for:", email)
      setUser(foundUser)
      localStorage.setItem("soccer_dashboard_current_user", JSON.stringify(foundUser))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    console.log("Logging out current user")
    setUser(null)
    localStorage.removeItem("soccer_dashboard_current_user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
