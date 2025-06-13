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
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Restore session from Supabase Auth on initial render
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[DEBUG] Supabase session:', session)
      if (session?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
        console.log('[DEBUG] User profile fetch (restoreSession):', { userId: session.user.id, userProfile, profileError })
        if (userProfile) {
          setUser({
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            createdAt: userProfile.created_at,
          })
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    restoreSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('[DEBUG] Login result:', { signInData, signInError })
      if (signInError || !signInData.user) {
        setError(signInError?.message || "Login failed. Please check your credentials.")
        setIsLoading(false)
        return false
      }
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", signInData.user.id)
        .single()
      console.log('[DEBUG] User profile fetch (login):', { userId: signInData.user.id, userProfile, profileError })
      if (profileError || !userProfile) {
        setError("User profile not found.")
        setIsLoading(false)
        return false
      }
      const foundUser: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        createdAt: userProfile.created_at,
      }
      setUser(foundUser)
      setIsLoading(false)
      return true
    } catch (error: any) {
      setError(error.message || "Unexpected login error.")
      setIsLoading(false)
      console.error('[DEBUG] Login error:', error)
      return false
    }
  }

  const logout = async () => {
    setUser(null)
    setError(null)
    await supabase.auth.signOut()
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
