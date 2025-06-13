"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2 } from "lucide-react"

export function CacheStatus() {
  const [redisStats, setRedisStats] = useState({
    totalTicketsCreated: 0,
    totalTicketsValidated: 0,
  })
  const [isClearing, setIsClearing] = useState(false)
  const [lastCleared, setLastCleared] = useState<string | null>(null)

  useEffect(() => {
    fetchRedisStats()
  }, [])

  const fetchRedisStats = async () => {
    try {
      const response = await fetch("/api/analytics/redis")
      const data = await response.json()
      setRedisStats(data)
    } catch (error) {
      console.error("Failed to fetch Redis stats:", error)
    }
  }

  const clearCache = async () => {
    setIsClearing(true)
    try {
      const response = await fetch("/api/cache", {
        method: "DELETE",
      })

      if (response.ok) {
        setLastCleared(new Date().toLocaleTimeString())
        // Refresh stats after clearing
        setTimeout(fetchRedisStats, 1000)
      }
    } catch (error) {
      console.error("Failed to clear cache:", error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Cache Status</CardTitle>
            <CardDescription>Redis cache and analytics</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={fetchRedisStats}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clearCache} disabled={isClearing}>
              <Trash2 className="h-4 w-4" />
              {isClearing ? "Clearing..." : "Clear Cache"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Tickets Created</p>
            <p className="text-2xl font-bold">{redisStats.totalTicketsCreated}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Tickets Validated</p>
            <p className="text-2xl font-bold">{redisStats.totalTicketsValidated}</p>
          </div>
        </div>

        {lastCleared && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Cache cleared at {lastCleared}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
