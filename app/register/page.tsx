"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [employeeCode, setEmployeeCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const EMPLOYEE_CODE = "BANGA2024"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!name || !email || !password || !employeeCode) {
      setError("Visi laukai yra privalomi")
      return
    }

    if (employeeCode !== EMPLOYEE_CODE) {
      setError("Neteisingas darbuotojo kodas")
      return
    }

    if (password !== confirmPassword) {
      setError("Slaptažodžiai nesutampa")
      return
    }

    if (password.length < 6) {
      setError("Slaptažodis turi būti bent 6 simbolių")
      return
    }

    setIsLoading(true)

    try {
      // Register user with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }
      // Insert user into users table for profile info
      const { user } = signUpData
      if (user) {
        await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          name,
          role: "staff",
        })
      }
      // Use the login function from auth context
      const success = await login(email, password)
      if (success) {
        console.log("Registration successful, redirecting to dashboard...")
        window.location.href = "/dashboard/overview"
      } else {
        setError("Registration successful but login failed. Please try logging in manually.")
      }
    } catch (err) {
      setError("An error occurred during registration")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full mx-4 max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sukurti paskyrą</CardTitle>
          <CardDescription>Įveskite savo duomenis, kad sukurtumėte paskyrą ir galėtumėte valdyti FB Banga bilietus</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vardas</Label>
              <Input id="name" placeholder="Jonas Jonaitis" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">El. paštas</Label>
              <Input
                id="email"
                type="email"
                placeholder="jonas@pavyzdys.lt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Slaptažodis</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Pakartokite slaptažodį</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Darbuotojo kodas</Label>
              <Input
                id="employeeCode"
                placeholder="Įveskite darbuotojo kodą"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kuriama paskyra...
                </>
              ) : (
                "Registruotis"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Jau turite paskyrą?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Prisijungti
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
