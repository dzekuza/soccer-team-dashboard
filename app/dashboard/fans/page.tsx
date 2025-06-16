"use client";

import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { supabaseService } from "@/lib/supabase-service"
import { supabase } from "@/lib/supabase"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

interface Fan {
  id: string;
  name: string;
  email: string;
  eventsAttended: number;
  moneySpent: number;
  subscriptionStatus?: string;
  subscriptionExpiry?: string;
}

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFans = async () => {
      try {
        // Fetch all tickets and all pricing tiers (no eventId filter)
        const [tickets, tiers, userSubs] = await Promise.all([
          supabaseService.getTicketsWithDetails(),
          supabase.from("pricing_tiers").select("*").then(({ data }) => data || []),
          supabase.from("user_subscriptions").select("*, users:user_id(email), subscriptions(title, duration_days)").then(({ data }) => data || []),
        ])
        // Build price map
        const tierPriceMap = Object.fromEntries((tiers || []).map(t => [t.id, t.price]))
        // Build subscription map by email
        const subMap = new Map<string, { status: string, expiry: string }>()
        for (const us of userSubs) {
          const userEmail = us.users?.email
          let status = "Nėra";
          let expiry = "-";
          if (us.expires_at) {
            const now = new Date();
            const exp = new Date(us.expires_at);
            status = exp > now ? "Galioja" : "Nebegalioja";
            expiry = exp.toLocaleDateString();
          }
          if (userEmail) {
            // Only keep the latest/valid subscription
            if (!subMap.has(userEmail) || (us.expires_at && new Date(us.expires_at) > new Date(subMap.get(userEmail)?.expiry || 0))) {
              subMap.set(userEmail, { status, expiry })
            }
          }
        }
        // Aggregate fans
        const fanMap = new Map<string, { id: string, name: string, email: string, events: Set<string>, moneySpent: number, subscriptionStatus?: string, subscriptionExpiry?: string }>()
        for (const t of tickets || []) {
          if (!t.purchaserEmail) continue
          const key = t.purchaserEmail
          if (!fanMap.has(key)) {
            fanMap.set(key, {
              id: key,
              name: t.purchaserName || "",
              email: t.purchaserEmail,
              events: new Set(),
              moneySpent: 0,
              subscriptionStatus: subMap.get(key)?.status || "Nėra",
              subscriptionExpiry: subMap.get(key)?.expiry || "-",
            })
          }
          const fan = fanMap.get(key)!
          fan.events.add(t.eventId)
          fan.moneySpent += Number(t.tier?.price || tierPriceMap[t.tierId] || 0)
        }
        const fans = Array.from(fanMap.values()).map(fan => ({
          id: fan.id,
          name: fan.name,
          email: fan.email,
          eventsAttended: fan.events.size,
          moneySpent: fan.moneySpent,
          subscriptionStatus: fan.subscriptionStatus,
          subscriptionExpiry: fan.subscriptionExpiry,
        }))
        setFans(fans)
      } finally {
        setLoading(false)
      }
    }
    fetchFans()
  }, [])

  const filteredFans = fans.filter(
    (fan) =>
      fan.name.toLowerCase().includes(filter.toLowerCase()) ||
      fan.email.toLowerCase().includes(filter.toLowerCase())
  );

  const exportEmails = () => {
    const emails = filteredFans.map((fan) => fan.email).join(",\n");
    const blob = new Blob([emails], { type: "text/csv" });
    saveAs(blob, "fan-emails.csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Gerbėjai</h1>
        <button
          onClick={exportEmails}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          Eksportuoti el. paštus (CSV)
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtruoti pagal vardą arba el. paštą..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
        />
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vardas</TableHead>
              <TableHead>El. paštas</TableHead>
              <TableHead>Aplankyti renginiai</TableHead>
              <TableHead>Išleista suma (€)</TableHead>
              <TableHead>Prenumerata</TableHead>
              <TableHead>Galioja iki</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">Įkeliama...</TableCell>
              </TableRow>
            ) : filteredFans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">Gerbėjų nerasta.</TableCell>
              </TableRow>
            ) : (
              filteredFans.map((fan) => (
                <TableRow key={fan.id}>
                  <TableCell>{fan.name}</TableCell>
                  <TableCell>{fan.email}</TableCell>
                  <TableCell className="text-center">{fan.eventsAttended}</TableCell>
                  <TableCell className="text-right">{fan.moneySpent.toFixed(2)}</TableCell>
                  <TableCell>{fan.subscriptionStatus}</TableCell>
                  <TableCell>{fan.subscriptionExpiry}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 