"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log(`Bandoma registruoti naują vartotoją: ${email} su vardu: ${name}`);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'admin'
          }
        }
      })

      if (authError) {
        console.error("Supabase registracijos klaida:", authError.message);
        throw authError
      }

      if (authData.user) {
        console.log("Vartotojas sėkmingai sukurtas:", authData.user.id);
        console.log("Atnaujinama sesija ir nukreipiama...");
        await router.refresh();
        router.replace('/dashboard/overview');
        console.log("Nukreipimas į /dashboard/overview įvykdytas.");
      } else {
        console.warn("Registracija pavyko, bet nebuvo gauti vartotojo duomenys.");
      }
    } catch (error: any) {
      console.error("Klaida registracijos bloke:", error);
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full mx-4 max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Registracija</CardTitle>
          <CardDescription>Sukurkite naują paskyrą</CardDescription>
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
              <Input
                id="name"
                type="text"
                placeholder="Jonas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registruojama...
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
