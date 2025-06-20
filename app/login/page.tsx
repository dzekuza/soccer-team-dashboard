"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (searchParams?.get('registered') === 'true') {
      setSuccess('Registracija sėkminga! Galite prisijungti.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      console.log(`Bandoma prijungti vartotoją: ${email}`);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase prisijungimo klaida:", error.message);
        setError("Neteisingas el. paštas arba slaptažodis")
      } else {
        console.log("Vartotojas sėkmingai prijungtas. Atnaujinama sesija ir nukreipiama...");
        await router.refresh()
        router.replace("/dashboard/overview")
        console.log("Nukreipimas į /dashboard/overview įvykdytas.");
      }
    } catch (err) {
      console.error("Klaida prisijungimo bloke:", err);
      setError("Įvyko klaida bandant prisijungti")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full mx-4 max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Futbolo komandos valdymas</CardTitle>
          <CardDescription>Įveskite savo prisijungimo duomenis norėdami pasiekti valdymo skydelį</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">El. paštas</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pavyzdys.lt"
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
                placeholder="slaptazodis123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Prisijungiama...
                </>
              ) : (
                "Prisijungti"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-gray-600">
          <p className="w-full">Numatyti duomenys: admin@pavyzdys.lt / slaptazodis123</p>
          <p>
            Neturite paskyros?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Registruotis
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
