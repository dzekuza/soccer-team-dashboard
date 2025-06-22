"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { EventStats, TicketWithDetails, RecentActivity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Ticket, Users, DollarSign, TrendingUp, Clock } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { supabaseService } from "@/lib/supabase-service"
import type { Event } from "@/lib/types"
// import { initializeDemoData } from "@/lib/init-demo-data"

export default function DashboardOverview() {
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    totalTickets: 0,
    validatedTickets: 0,
    totalRevenue: 0,
  })
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, eventsData, ticketsData] = await Promise.all([
          supabaseService.getEventStats(),
          supabaseService.getEvents(),
          supabaseService.getTicketsWithDetails(),
        ])

        setStats(statsData)
        setRecentEvents(eventsData.slice(0, 3))
        setRecentTickets(ticketsData.slice(0, 5))

        const activity: RecentActivity[] = [
          ...eventsData.slice(0, 2).map((event: Event) => ({
            type: "event_created" as const,
            title: `Event Created: ${event.title}`,
            timestamp: event.created_at,
            details: `${event.date} at ${event.time}`,
          })),
          ...ticketsData.slice(0, 3).filter(ticket => ticket.events).map((ticket: TicketWithDetails) => ({
            type: ticket.status === 'validated' ? ("ticket_validated" as const) : ("ticket_generated" as const),
            title: ticket.status === 'validated' ? `Ticket Validated` : `Ticket Generated`,
            timestamp: ticket.updated_at || ticket.created_at,
            details: `${ticket.events.title} - ${ticket.purchaser_name}`,
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setRecentActivity(activity.slice(0, 5))
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
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
            <CardTitle className="text-sm font-medium">Iš viso renginių</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Sukurti aktyvūs renginiai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iš viso bilietų</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">{stats.validatedTickets || 0} patvirtinta ({Math.round((stats.validatedTickets / stats.totalTickets) * 100) || 0}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iš viso pajamų</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue || 0)}</div>
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
              {Math.round((stats.validatedTickets / stats.totalTickets) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Bilietai patvirtinti</p>
          </CardContent>
        </Card>
      </div>
      {/* Recent Events and Activity */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Naujausi renginiai</CardTitle>
            <CardDescription>Naujausi sukurti renginiai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTickets.length > 0 ? (
              recentTickets.filter(ticket => ticket.events).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{ticket.events.title}</h4>
                    <p className="text-sm text-gray-600">
                      {ticket.events.date} at {ticket.events.time}
                    </p>
                    <p className="text-sm text-gray-500">{ticket.events.location}</p>
                  </div>
                  <Badge variant="outline">{ticket.status === 'validated' ? 'Patvirtintas' : 'Generuotas'}</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Dar nėra sukurtų renginių</p>
            )}
          </CardContent>
        </Card>
        <Card>
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
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nėra naujausios veiklos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
