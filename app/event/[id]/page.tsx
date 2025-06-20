"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AlertTriangle, CalendarIcon, MapPinIcon } from "lucide-react"
import type { EventWithTiers, Team, PricingTier } from "@/lib/types"
import EventHeader from "@/components/event-header"

const CalendarIconWrapper = () => (
    <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        ></path>
    </svg>
)

export default function EventPage() {
    const params = useParams()
    const { id } = params as { id: string }
    const [event, setEvent] = useState<EventWithTiers | null>(null)
    const [team1, setTeam1] = useState<Team | null>(null)
    const [team2, setTeam2] = useState<Team | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedTier, setSelectedTier] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        if (!id) return

        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch(`/api/events/${id}`)
                if (!res.ok) {
                    throw new Error("Failed to fetch event data")
                }
                const data = await res.json()
                setEvent(data.event)
                setTeam1(data.team1)
                setTeam2(data.team2)
                if (data.event?.pricing_tiers?.length > 0) {
                    setSelectedTier(data.event.pricing_tiers[0])
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const handleBuyTicket = () => {
        if (selectedTier) {
            router.push(`/checkout?eventId=${event?.id}&tierId=${selectedTier.id}`)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-main text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-main text-white p-4">
                <AlertTriangle className="w-16 h-16 text-yellow-400 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Renginys nerastas</h2>
                <p className="text-lg text-gray-300">
                    {error ||
                        "Atsiprašome, nepavyko rasti informacijos apie šį renginį."}
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#13007C] text-white font-sans">
            <EventHeader />
            <header
                className="relative bg-cover bg-center py-20"
                style={{ backgroundImage: `url(${event.cover_image_url ?? "/bg qr.jpg"})` }}
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-around text-center">
                        <div className="flex flex-col items-center mb-8 md:mb-0">
                            {team1?.logo && (
                                <Image
                                    src={team1.logo}
                                    alt={team1.team_name}
                                    width={100}
                                    height={100}
                                    className="mb-4"
                                />
                            )}
                            <h2 className="text-4xl font-bold">{team1?.team_name}</h2>
                        </div>
                        <div className="text-6xl font-extrabold mx-8">VS</div>
                        <div className="flex flex-col items-center">
                            {team2?.logo && (
                                <Image
                                    src={team2.logo}
                                    alt={team2.team_name}
                                    width={100}
                                    height={100}
                                    className="mb-4"
                                />
                            )}
                            <h2 className="text-4xl font-bold">{team2?.team_name}</h2>
                        </div>
                    </div>
                    <div className="mt-12 text-center">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <CalendarIconWrapper />
                            <p className="text-2xl">
                                {event.date && new Date(event.date).toLocaleDateString("lt-LT", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}{" "}
                                {event.time}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <MapPinIcon className="w-6 h-6" />
                            <p className="text-2xl">{event.location}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <section>
                            <h3 className="text-4xl font-bold mb-6">Apie Renginį</h3>
                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                <p>{event.description}</p>
                            </div>
                        </section>
                    </div>

                    <div className="md:col-span-1">
                        <aside className="bg-div-main p-8 rounded-lg border-main">
                            <h3 className="text-2xl font-bold mb-6 text-center">
                                Pasirinkite Bilieto Tipą
                            </h3>
                            <div className="space-y-4 mb-8">
                                {event.pricing_tiers.map((tier: PricingTier) => (
                                    <div
                                        key={tier.id}
                                        onClick={() => setSelectedTier(tier)}
                                        className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${selectedTier?.id === tier.id
                                                ? "border-2 border-main-orange bg-main-orange/10"
                                                : "border border-main"
                                            }`}
                                    >
                                        <h4 className="text-xl font-semibold">{tier.name}</h4>
                                    </div>
                                ))}
                            </div>

                            {selectedTier && (
                                <div className="border-t border-main pt-6 space-y-4">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-400">Bilieto Tipas:</span>
                                        <span className="font-semibold">{selectedTier.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-400">Kaina:</span>
                                        <span className="font-semibold text-2xl text-main-orange">
                                            €{selectedTier.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBuyTicket}
                                disabled={!selectedTier}
                                className="w-full mt-8 bg-main-orange text-white py-4 rounded-lg text-xl font-bold hover:bg-orange-700 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Pirkti Bilietą
                            </button>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    )
} 