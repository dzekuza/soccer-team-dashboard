"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import type { EventWithTiers, Team, PricingTier } from "@/lib/types"

// Add team details to the event type
interface PublicEvent extends EventWithTiers {
  team1: Team | null;
  team2: Team | null;
  pricing_tiers: PricingTier[];
}

export default function PublicEventPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params as { id: string }
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [selectedTierId, setSelectedTierId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError("No event ID provided.");
        return;
    }

    setLoading(true);
    fetch(`/api/events/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `Request failed with status ${res.status}` }));
          throw new Error(errorData.error || "Event not found");
        }
        return res.json();
      })
      .then((eventData) => {
        setEvent(eventData);
        if (eventData.pricing_tiers && eventData.pricing_tiers.length > 0) {
          setSelectedTierId(eventData.pricing_tiers[0].id);
        }
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load event:", err);
        setError(err.message || "Failed to load event.");
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center text-white">
        <div className="mx-auto text-orange-400 w-10 h-10 mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
        <p className="mb-4">{error || "This event does not exist or could not be loaded."}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:underline">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const team1 = event.team1;
  const team2 = event.team2;
  const selectedTier = event.pricing_tiers.find((t: PricingTier) => t.id === selectedTierId)

  return (
    <div className="min-h-screen bg-[#0A165B] text-white font-sans">
      {/* HEADLINE */}
      <div className="w-full max-w-6xl mx-auto pt-12 px-6">
        <h1 className="text-5xl font-extrabold mb-8 tracking-tight leading-tight">{event.title}</h1>
      </div>
      {/* EVENT INFO BAR */}
      <div className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FFB347] py-10 px-0 flex flex-col items-center">
        <div className="w-full max-w-6xl flex items-center justify-between mx-auto">
          <div className="flex flex-col items-center flex-1">
            {team1 && team1.logo && <Image src={team1.logo} alt={team1.team_name} width={72} height={72} className="bg-white rounded-lg p-2 shadow-lg" />}
            <span className="mt-3 font-bold text-lg md:text-2xl text-white drop-shadow text-center">{team1?.team_name || "Komanda 1"}</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 text-white text-xl md:text-2xl font-bold">
              <span className="inline-flex items-center gap-2">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {event.date}, {event.time}
              </span>
            </div>
            <div className="text-white text-base md:text-lg mt-2 font-medium text-center opacity-90">{event.location}</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            {team2 && team2.logo && <Image src={team2.logo} alt={team2.team_name} width={72} height={72} className="bg-white rounded-lg p-2 shadow-lg" />}
            <span className="mt-3 font-bold text-lg md:text-2xl text-white drop-shadow text-center">{team2?.team_name || "Komanda 2"}</span>
          </div>
        </div>
      </div>
      {/* ABOUT + TICKETS GRID */}
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 border-t border-[#232b5d]" style={{minHeight: '400px'}}>
        {/* ABOUT */}
        <div className="border-r border-[#232b5d] flex flex-col">
          <h2 className="text-3xl font-extrabold mb-6 tracking-tight text-white pt-12 pl-12">About</h2>
          <div className="flex-1 flex items-start">
            <div className="bg-[#232b5d] rounded-xl p-8 text-lg leading-relaxed shadow-lg text-white ml-12 mb-12 w-full">
              {event.description || "No event description provided."}
            </div>
          </div>
        </div>
        {/* TICKET SELECTOR */}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold mb-6 tracking-wide text-white pt-12 pl-12 uppercase">Pasirinkite bilieto tipą</h3>
          <div className="flex-1 flex flex-col items-start justify-start pl-12 pr-12">
            <div className="flex gap-3 mb-8 w-full">
              {event.pricing_tiers.map((tier: PricingTier) => (
                <button
                  key={tier.id}
                  className={`flex-1 px-6 py-4 rounded-xl border-2 text-lg font-bold transition-all ${selectedTierId === tier.id ? "border-[#FF7A00] bg-[#181f4b] text-white" : "border-[#232b5d] bg-[#232b5d] text-gray-400"}`}
                  onClick={() => setSelectedTierId(tier.id)}
                >
                  {tier.name}
                </button>
              ))}
            </div>
            <Link
              href={`/checkout?eventId=${event.id}&tierId=${selectedTierId}`}
              className="block w-full text-center py-4 rounded-xl bg-[#FF7A00] hover:bg-[#FFB347] text-white font-extrabold text-xl transition-all shadow-lg mb-8"
            >
              Pirkti bilietą
            </Link>
            <div className="mb-8 w-full">
              <div className="flex items-center justify-between mb-2 text-white">
                <span className="text-base opacity-70 uppercase">Bilieto tipas</span>
                <span className="text-base font-bold">{selectedTier?.name}</span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span className="text-base opacity-70 uppercase">Bilieto kaina</span>
                <span className="text-2xl font-extrabold">{selectedTier ? formatCurrency(selectedTier.price) : "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 