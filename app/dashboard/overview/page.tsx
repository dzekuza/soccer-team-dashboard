"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Ticket, Users, DollarSign, TrendingUp, Clock } from "lucide-react"
import type { Event, TicketWithDetails } from "@/lib/types"
import { CacheStatus } from "@/components/cache-status"
// import { initializeDemoData } from "@/lib/init-demo-data"

interface DashboardStats {
  totalEvents: number
  totalTickets: number
  validatedTickets: number
  totalRevenue: number
}

interface RecentActivity {
  type: "event_created" | "ticket_generated" | "ticket_validated"
  title: string
  timestamp: string
  details: string
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalTickets: 0,
    validatedTickets: 0,
    totalRevenue: 0,
  })
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [recentTickets, setRecentTickets] = useState<TicketWithDetails[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, eventsResponse, ticketsResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/events"),
        fetch("/api/tickets"),
      ])

      const statsData = await statsResponse.json()
      const eventsData = await eventsResponse.json()
      const ticketsData = await ticketsResponse.json()

      setStats(statsData)
      setRecentEvents(eventsData.slice(0, 3))
      setRecentTickets(ticketsData.slice(0, 5))

      // Generate recent activity
      const activity: RecentActivity[] = [
        ...eventsData.slice(0, 2).map((event: Event) => ({
          type: "event_created" as const,
          title: `Event Created: ${event.title}`,
          timestamp: event.createdAt,
          details: `${event.date} at ${event.time}`,
        })),
        ...ticketsData.slice(0, 3).map((ticket: TicketWithDetails) => ({
          type: ticket.isValidated ? ("ticket_validated" as const) : ("ticket_generated" as const),
          title: ticket.isValidated ? `Ticket Validated` : `Ticket Generated`,
          timestamp: ticket.validatedAt || ticket.createdAt,
          details: `${ticket.event.title} - ${ticket.purchaserName}`,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setRecentActivity(activity.slice(0, 5))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-600">Complete overview of your soccer team events and tickets</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Active events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.validatedTickets} validated ({Math.round((stats.validatedTickets / stats.totalTickets) * 100) || 0}
              %)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From ticket sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.validatedTickets / stats.totalTickets) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Tickets validated</p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Status */}
      <CacheStatus />

      {/* Recent Events and Activity */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest events created</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No events created yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activity</CardDescription>
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
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>Latest tickets generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium">{ticket.event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {ticket.tier.name} - {formatCurrency(ticket.tier.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{ticket.purchaserName}</p>
                        <p className="text-sm text-gray-600">{ticket.purchaserEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={ticket.isValidated ? "default" : "secondary"}>
                      {ticket.isValidated ? "Validated" : "Valid"}
                    </Badge>
                    <p className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tickets generated yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex flex-col space-y-2" onClick={() => (window.location.href = "/dashboard")}>
              <CalendarDays className="h-6 w-6" />
              <span>Create Event</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => (window.location.href = "/dashboard/tickets")}
            >
              <Ticket className="h-6 w-6" />
              <span>Generate Ticket</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => (window.location.href = "/dashboard/scanner")}
            >
              <Users className="h-6 w-6" />
              <span>Scan QR Code</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
