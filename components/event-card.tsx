"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Clock, MapPin, Share2, Ticket, Trash2 } from "lucide-react"
import type { EventWithTiers, TicketWithDetails, Team } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface EventCardProps {
  event: EventWithTiers
  tickets: TicketWithDetails[]
  teams: Team[]
  onDelete: (id: string) => void
  deletingId: string | null
}

export function EventCard({ event, tickets, teams, onDelete, deletingId }: EventCardProps) {
  const getTeam = (id?: string) => teams.find(t => t.id === id)
  const team1 = getTeam(event.team1Id)
  const team2 = getTeam(event.team2Id)
  const eventTickets = tickets.filter(t => t.eventId === event.id)
  const missingTeam = !team1 || !team2

  const totalGenerated = event.pricingTiers?.reduce((acc, tier) => acc + eventTickets.filter(t => t.tierId === tier.id).length, 0) || 0
  const totalQuantity = event.pricingTiers?.reduce((acc, tier) => acc + tier.quantity, 0) || 0
  const progress = totalQuantity > 0 ? (totalGenerated / totalQuantity) * 100 : 0

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card text-card-foreground">
      <div className="relative">
        <Image 
          src={event.coverImageUrl || '/placeholder.jpg'} 
          alt={event.title} 
          width={400} 
          height={200} 
          className="w-full h-48 object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <CardTitle className="text-white text-xl font-bold">
            <Link href={`/dashboard/events/${event.id}`} className="hover:underline">
              {event.title}
            </Link>
          </CardTitle>
        </div>
      </div>
      
      <CardHeader className="pt-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-2">
            {team1 ? (
              <Image src={team1.logo || '/placeholder-logo.svg'} alt={team1.team_name} width={48} height={48} className="rounded-full bg-background p-1" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full">
                <AlertTriangle className="text-muted-foreground" />
              </div>
            )}
            <span className="font-semibold text-sm">{team1?.team_name || "Nėra"}</span>
          </div>
          <span className="text-muted-foreground font-bold">VS</span>
          <div className="flex flex-col items-center gap-2">
            {team2 ? (
              <Image src={team2.logo || '/placeholder-logo.svg'} alt={team2.team_name} width={48} height={48} className="rounded-full bg-background p-1" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full">
                <AlertTriangle className="text-muted-foreground" />
              </div>
            )}
            <span className="font-semibold text-sm">{team2?.team_name || "Nėra"}</span>
          </div>
        </div>
        {missingTeam && (
          <div className="flex items-center gap-2 text-yellow-500 text-xs mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Įspėjimas: viena arba abi komandos nerastos</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="w-4 h-4 mr-2" /> 
          <span>{new Date(event.date).toLocaleDateString('lt-LT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium">Bilietai</p>
            <p className="text-xs font-mono">{totalGenerated} / {totalQuantity}</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2 dark:bg-gray-700">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 p-4 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(`${window.location.origin}/event/${event.id}`)
            alert('Nuoroda nukopijuota!')
          }}
        >
          <Share2 className="w-4 h-4 mr-2" /> Dalintis
        </Button>
        <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => (window.location.href = `/dashboard/tickets?eventId=${event.id}`)}
            >
              <Ticket className="w-4 h-4 mr-2" /> Bilietai
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deletingId === event.id}
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 