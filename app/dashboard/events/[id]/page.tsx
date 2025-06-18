"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { EventWithTiers, Team } from "@/lib/types"
import { supabaseService } from "@/lib/supabase-service"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params as { id: string }
  const [event, setEvent] = useState<EventWithTiers | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      supabaseService.getEventWithTiers(id),
      supabaseService.getTeams(),
    ])
      .then(([eventData, teamsData]) => {
        setEvent(eventData)
        setTeams(teamsData)
        setError(null)
      })
      .catch((err) => {
        setError(typeof err === "string" ? err : "Failed to load event.")
        setEvent(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const getTeam = (teamId?: string) => teams.find(t => t.id === teamId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <AlertTriangle className="mx-auto text-yellow-600 w-10 h-10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Renginys nerastas</h2>
        <p className="text-gray-600 mb-4">{error || "Šis renginys neegzistuoja arba jo nepavyko įkelti."}</p>
        <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-blue-700 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Atgal į renginius
        </Link>
      </div>
    )
  }

  const team1 = getTeam(event.team1Id)
  const team2 = getTeam(event.team2Id)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-blue-700 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Atgal į renginius
      </Link>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {team1 ? (
                <Image src={team1.logo} alt={team1.team_name} width={36} height={36} className="rounded bg-white p-1" />
              ) : (
                <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded">
                  <AlertTriangle className="text-gray-400 w-6 h-6" />
                </div>
              )}
              <span className="font-semibold text-base">{team1?.team_name || "Nežinoma komanda"}</span>
            </div>
            <span className="text-xs text-gray-500">prieš</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{team2?.team_name || "Nežinoma komanda"}</span>
              {team2 ? (
                <Image src={team2.logo} alt={team2.team_name} width={36} height={36} className="rounded bg-white p-1" />
              ) : (
                <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded">
                  <AlertTriangle className="text-gray-400 w-6 h-6" />
                </div>
              )}
            </div>
          </div>
          {( !team1 || !team2 ) && (
            <div className="flex items-center gap-2 text-yellow-700 text-xs mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Įspėjimas: viena arba abi komandos nerastos</span>
            </div>
          )}
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Data:</span> {event.date}
            </p>
            <p>
              <span className="font-medium">Laikas:</span> {event.time}
            </p>
            <p>
              <span className="font-medium">Vieta:</span> {event.location}
            </p>
            <div className="pt-2">
              <p className="font-medium mb-1">Kainų lygiai:</p>
              <div className="space-y-1">
                {event.pricingTiers.map((tier) => (
                  <div key={tier.id} className="flex justify-between items-center">
                    <span>{tier.name}</span>
                    <div className="flex items-center space-x-2">
                      <span>{formatCurrency(tier.price)}</span>
                      <Badge variant="outline" className="text-xs">
                        Maks.: {tier.maxQuantity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 