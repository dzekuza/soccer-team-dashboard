"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { EventStats, TicketWithDetails, RecentActivity, Event } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Ticket, Users, Euro, TrendingUp, Clock } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface OverviewClientProps {
  initialStats: EventStats;
  initialRecentTickets: TicketWithDetails[];
  initialRecentActivity: RecentActivity[];
}

export default function OverviewClient({
  initialStats,
  initialRecentTickets,
  initialRecentActivity
}: OverviewClientProps) {
  const [stats, setStats] = useState<EventStats>(initialStats)
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>(initialRecentTickets)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(initialRecentActivity)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Suvestinė</h1>
        <p className="text-gray-600">Pilna Jūsų futbolo komandos renginių ir bilietų apžvalga</p>
      </div>
      {/* Key Metrics */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iš viso bilietų</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">{stats.ticketsScanned || 0} patvirtinta ({Math.round((stats.ticketsScanned / stats.totalTickets) * 100) || 0}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iš viso pajamų</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Iš bilietų pardavimų</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patvirtinimo rodiklis</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.ticketsScanned / stats.totalTickets) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Bilietai patvirtinti</p>
          </CardContent>
        </Card>
      </div>
      {/* Recent Events and Activity */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Naujausi bilietai</CardTitle>
            <CardDescription>Naujausi sugeneruoti bilietai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div>
                    <h4 className="font-medium">{ticket.event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {ticket.event.date} at {ticket.event.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{ticket.purchaserName}</p>
                  </div>
                  <Badge variant="outline">{ticket.isValidated ? 'Patvirtintas' : 'Generuotas'}</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Dar nėra sukurtų bilietų</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Naujausia veikla</CardTitle>
            <CardDescription>Naujausia sistemos veikla</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === "event_created" && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                    {activity.type === "ticket_generated" && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    )}
                    {activity.type === "ticket_validated" && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nėra naujausios veiklos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 