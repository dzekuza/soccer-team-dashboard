"use client";

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Fan } from "@/lib/types"

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFans() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/fans')
        if (!res.ok) {
          throw new Error('Nepavyko gauti fanų duomenų')
        }
        const data = await res.json()
        setFans(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFans()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-semibold">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fanai</h1>
        <p className="text-muted-foreground">Jūsų komandos fanų ir pirkėjų apžvalga.</p>
      </div>
      <div className="bg-card text-card-foreground rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fanas</TableHead>
              <TableHead className="text-center">Bilietų kiekis</TableHead>
              <TableHead className="text-right">Išleista suma</TableHead>
              <TableHead className="text-center">Prenumerata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fans.length > 0 ? (
              fans
                .sort((a: Fan, b: Fan) => b.money_spent - a.money_spent)
                .map((fan: Fan, index: number) => (
                  <TableRow key={`${fan.email}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{fan.name}</div>
                      <div className="text-sm text-muted-foreground">{fan.email}</div>
                    </TableCell>
                    <TableCell className="text-center">{fan.total_tickets}</TableCell>
                    <TableCell className="text-right">{formatCurrency(fan.money_spent)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={fan.has_valid_subscription ? "default" : "secondary"}>
                        {fan.has_valid_subscription ? "Aktyvi" : "Neaktyvi"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  Fanų nerasta.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 