"use client";

import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";

interface Event {
  id: string;
  title: string;
  pricingTiers: PricingTier[];
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  maxQuantity: number;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    const tierId = searchParams.get("tierId");
    if (eventId) setSelectedEventId(eventId);
    if (tierId) setSelectedTierId(tierId);
  }, [searchParams]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedTier = selectedEvent?.pricingTiers.find((t) => t.id === selectedTierId);
  const totalPrice = selectedTier ? selectedTier.price * quantity : 0;

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Order Summary (Left) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-[#f6f8fb] border-r border-gray-200">
          <div>
            <h2 className="text-[#697386] text-lg font-medium mb-2">Order Summary</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[#1a1f36] text-base font-medium">Event</span>
                <span className="text-[#1a1f36] text-base">{selectedEvent?.title || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#1a1f36] text-base font-medium">Ticket Type</span>
                <span className="text-[#1a1f36] text-base">{selectedTier?.name || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#1a1f36] text-base font-medium">Quantity</span>
                <span className="text-[#1a1f36] text-base">{quantity}</span>
              </div>
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <span className="text-[#1a1f36] text-lg font-semibold">Total</span>
                <span className="text-[#1a1f36] text-3xl font-bold tracking-tight">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Checkout Form (Right) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-[#1a1f36] mb-6">Checkout</h1>
          <form
            className="flex flex-col gap-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError("");
              try {
                const res = await fetch("/api/checkout/session", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    eventId: selectedEventId,
                    tierId: selectedTierId,
                    quantity,
                    purchaserName,
                    purchaserEmail,
                  }),
                });
                const data = await res.json();
                if (res.ok && data.url) {
                  window.location.href = data.url;
                } else {
                  setError(data.error || "Failed to start payment session.");
                }
              } catch (err) {
                setError("Network error. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {/* Event selection */}
            <div>
              <label className="block text-[#697386] text-sm font-medium mb-1">Select Event</label>
              <select
                className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedTierId("");
                }}
                required
                disabled={!!searchParams.get("eventId")}
              >
                <option value="">-- Choose an event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Pricing tier selection */}
            {selectedEvent && (
              <div>
                <label className="block text-[#697386] text-sm font-medium mb-1">Select Ticket Type</label>
                <select
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  required
                  disabled={!!searchParams.get("tierId")}
                >
                  <option value="">-- Choose a ticket type --</option>
                  {selectedEvent.pricingTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} (${tier.price})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Quantity */}
            {selectedTier && (
              <div>
                <label className="block text-[#697386] text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={selectedTier.maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            {/* Purchaser info */}
            <div>
              <label className="block text-[#697386] text-sm font-medium mb-1">Your Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={purchaserName}
                onChange={(e) => setPurchaserName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[#697386] text-sm font-medium mb-1">Your Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={purchaserEmail}
                onChange={(e) => setPurchaserEmail(e.target.value)}
                required
              />
            </div>
            {/* Payment button */}
            <button
              type="submit"
              className="w-full py-4 mt-2 bg-[#1a1f36] text-white text-lg font-semibold rounded-md shadow hover:bg-[#232946] transition"
              disabled={
                loading ||
                !selectedEventId ||
                !selectedTierId ||
                !purchaserName ||
                !purchaserEmail ||
                quantity < 1
              }
            >
              {loading ? "Redirecting to Stripe..." : `Pay $${totalPrice.toFixed(2)}`}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
} 