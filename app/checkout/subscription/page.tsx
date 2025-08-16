"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { loadStripe } from '@stripe/stripe-js';

interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_days: number;
}

export default function SubscriptionCheckoutPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch(() => setError("Failed to load subscription plans."));
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!selectedPlanId || !userEmail) {
        throw new Error("Pasirinkite planą ir įveskite savo el. paštą");
      }

      // Create checkout session
      const response = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-customer-email": userEmail,
        },
        body: JSON.stringify({
          subscriptionId: selectedPlanId,
        }),
      });

      const { url, error: apiError } = await response.json();

      if (!response.ok) {
        throw new Error(apiError || "Nepavyko sukurti apmokėjimo sesijos");
      }

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("Nepavyko gauti apmokėjimo URL");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Įvyko nežinoma klaida');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A165B] flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-[#0A165B]/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Pasirinkite prenumeratą</h1>
        <form className="flex flex-col gap-6" onSubmit={handleCheckout}>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Pasirinkite planą</label>
            <select
              className="w-full p-3 rounded-md border border-gray-600 bg-[#0A2065] text-white focus:outline-none focus:ring-2 focus:ring-[#F15601]"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
            >
              <option value="">-- Pasirinkite prenumeratos planą --</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} ({plan.duration_days} dienų) - {formatCurrency(plan.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Jūsų el. paštas</label>
            <input
              type="email"
              className="w-full p-3 rounded-md border border-gray-600 bg-[#0A2065] text-white focus:outline-none focus:ring-2 focus:ring-[#F15601]"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          {selectedPlan && (
            <div className="bg-[#0A2065] p-4 rounded border border-gray-600">
              <h2 className="text-lg font-semibold mb-1 text-white">{selectedPlan.title}</h2>
              <p className="text-sm text-gray-300 mb-2">{selectedPlan.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">Trukmė:</span>
                <span className="text-gray-300">{selectedPlan.duration_days} dienų</span>
                <span className="text-white font-medium ml-6">Kaina:</span>
                <span className="text-2xl font-bold text-[#F15601]">{formatCurrency(selectedPlan.price)}</span>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-[#F15601] text-white text-lg font-semibold rounded-md shadow hover:bg-[#E04501] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !selectedPlanId || !userEmail}
          >
            {loading ? "Nukreipiama į Stripe..." : selectedPlan ? `Prenumeruoti už ${formatCurrency(selectedPlan.price)}` : "Prenumeruoti"}
          </button>
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 