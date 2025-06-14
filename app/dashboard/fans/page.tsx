"use client";

import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { supabaseService } from "@/lib/supabase-service"
import { supabase } from "@/lib/supabase"

interface Fan {
  id: string;
  name: string;
  email: string;
  eventsAttended: number;
  moneySpent: number;
}

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFans = async () => {
      try {
        // Fetch all tickets and all pricing tiers (no eventId filter)
        const [tickets, tiers] = await Promise.all([
          supabaseService.getTicketsWithDetails(),
          supabase.from("pricing_tiers").select("*").then(({ data }) => data || []),
        ])
        // Build price map
        const tierPriceMap = Object.fromEntries((tiers || []).map(t => [t.id, t.price]))
        // Aggregate fans
        const fanMap = new Map<string, { id: string, name: string, email: string, events: Set<string>, moneySpent: number }>()
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
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerbėjai</h1>
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
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Vardas</th>
              <th className="px-4 py-2 border-b">El. paštas</th>
              <th className="px-4 py-2 border-b">Aplankyti renginiai</th>
              <th className="px-4 py-2 border-b">Išleista suma (€)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">Įkeliama...</td>
              </tr>
            ) : filteredFans.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">Gerbėjų nerasta.</td>
              </tr>
            ) : (
              filteredFans.map((fan) => (
                <tr key={fan.id}>
                  <td className="px-4 py-2 border-b">{fan.name}</td>
                  <td className="px-4 py-2 border-b">{fan.email}</td>
                  <td className="px-4 py-2 border-b text-center">{fan.eventsAttended}</td>
                  <td className="px-4 py-2 border-b text-right">{fan.moneySpent.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 