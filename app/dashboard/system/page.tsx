"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Database, Zap, Server } from 'lucide-react'

interface SystemStatus {
  supabase: {
    connected: boolean
    responseTime: number
    lastCheck: string
    error?: string
  }
  redis: {
    connected: boolean
    responseTime: number
    lastCheck: string
  }
  api: {
    healthy: boolean
    responseTime: number
    lastCheck: string
  }
}

export default function SystemPage() {
  const [status, setStatus] = useState<SystemStatus>({
    supabase: { connected: false, responseTime: 0, lastCheck: "" },
    redis: { connected: false, responseTime: 0, lastCheck: "" },
    api: { healthy: false, responseTime: 0, lastCheck: "" },
  })
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    setIsChecking(true)
    const now = new Date().toISOString()

    try {
      // Check Supabase
      const supabaseStart = Date.now()
      const supabaseResponse = await fetch("/api/supabase/test")
      const supabaseTime = Date.now() - supabaseStart
      const supabaseData = await supabaseResponse.json()

      // Check Redis
      const redisStart = Date.now()
      const redisResponse = await fetch("/api/redis/test")
      const redisTime = Date.now() - redisStart
      const redisData = await redisResponse.json()

      // Check API
      const apiStart = Date.now()
      const apiResponse = await fetch("/api/events")
      const apiTime = Date.now() - apiStart
      const apiHealthy = apiResponse.ok

      setStatus({
        supabase: {
          connected: supabaseData.connected || false,
          responseTime: supabaseTime,
          lastCheck: now,
          error: supabaseData.error,
        },
        redis: {
          connected: redisData.connected || false,
          responseTime: redisTime,
          lastCheck: now,
        },
        api: {
          healthy: apiHealthy,
          responseTime: apiTime,
          lastCheck: now,
        },
      })
    } catch (error) {
      console.error("System check failed:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (connected: boolean) => {
    return connected ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (connected: boolean) => {
    return <Badge variant={connected ? "default" : "destructive"}>{connected ? "Healthy" : "Error"}</Badge>
  }

  const formatTime = (ms: number) => {
    return `${ms}ms`
  }

  const formatLastCheck = (timestamp: string) => {
    if (!timestamp) return "Never"
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Status</h1>
          <p className="text-gray-600">Monitor system health and performance</p>
        </div>
        <Button onClick={checkSystemStatus} disabled={isChecking}>
          {isChecking ? "Checking..." : "Refresh Status"}
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {status.supabase.connected && status.redis.connected && status.api.healthy ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            )}
            <span>Overall System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {status.supabase.connected && status.redis.connected && status.api.healthy
              ? "All Systems Operational"
              : "Some Issues Detected"}
          </div>
        </CardContent>
      </Card>

      {/* Individual Components */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Supabase Database</span>
              </div>
              {getStatusIcon(status.supabase.connected)}
            </CardTitle>
            <CardDescription>PostgreSQL Database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(status.supabase.connected)}
            </div>
            <div className="flex justify-between items-center">
              <span>Response Time:</span>
              <span className="font-mono">{formatTime(status.supabase.responseTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Check:</span>
              <span className="text-sm text-gray-600">{formatLastCheck(status.supabase.lastCheck)}</span>
            </div>
            {status.supabase.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {status.supabase.error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Redis Cache</span>
              </div>
              {getStatusIcon(status.redis.connected)}
            </CardTitle>
            <CardDescription>Upstash Redis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(status.redis.connected)}
            </div>
            <div className="flex justify-between items-center">
              <span>Response Time:</span>
              <span className="font-mono">{formatTime(status.redis.responseTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Check:</span>
              <span className="text-sm text-gray-600">{formatLastCheck(status.redis.lastCheck)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>API</span>
              </div>
              {getStatusIcon(status.api.healthy)}
            </CardTitle>
            <CardDescription>REST API Endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(status.api.healthy)}
            </div>
            <div className="flex justify-between items-center">
              <span>Response Time:</span>
              <span className="font-mono">{formatTime(status.api.responseTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Check:</span>
              <span className="text-sm text-gray-600">{formatLastCheck(status.api.lastCheck)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Technical details and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Data Storage</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Supabase PostgreSQL database</li>
                <li>• Real-time data operations</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Automatic backups</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Caching</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Upstash Redis</li>
                <li>• Multi-tier TTL strategy</li>
                <li>• Automatic cache invalidation</li>
                <li>• Real-time analytics tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• PDF ticket generation</li>
                <li>• QR code validation</li>
                <li>• Real-time dashboard</li>
                <li>• WordPress export</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Security</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Unique ticket IDs</li>
                <li>• Validation tracking</li>
                <li>• Secure QR codes</li>
                <li>• Data integrity checks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
