"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabaseService } from "@/lib/supabase-service"
import type { Subscription } from "@/lib/types"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true)
        const data = await supabaseService.getSubscriptions()
        setSubscriptions(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prenumeratos</h1>
      </div>

      {error && <p className="text-red-500">Klaida: {error}</p>}

      {loading ? (
        <p>Kraunasi...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Visos prenumeratos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pirkėjas</TableHead>
                  <TableHead>El. paštas</TableHead>
                  <TableHead>Galioja nuo</TableHead>
                  <TableHead>Galioja iki</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.purchaser_name || "-"}</TableCell>
                    <TableCell>{sub.purchaser_email || "-"}</TableCell>
                    <TableCell>{new Date(sub.valid_from).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(sub.valid_to).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 