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

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe.js not loaded');
      }

      // This is a placeholder for a real checkout flow.
      // In a real application, you would create a checkout session on your server
      // and then redirect to Stripe using the session ID.
      // For now, we'll just simulate a successful redirect.
      
      router.push('/checkout/subscription/success');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-[#1a1f36] mb-6">Choose a Subscription</h1>
        <form className="flex flex-col gap-6" onSubmit={handleCheckout}>
          <div>
            <label className="block text-[#697386] text-sm font-medium mb-1">Select Plan</label>
            <select
              className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
            >
              <option value="">-- Choose a subscription plan --</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} ({plan.duration_days} days) - {formatCurrency(plan.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#697386] text-sm font-medium mb-1">Your Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-md border border-gray-200 bg-white text-[#1a1f36] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          {selectedPlan && (
            <div className="bg-[#f6f8fb] p-4 rounded border border-gray-200">
              <h2 className="text-lg font-semibold mb-1">{selectedPlan.title}</h2>
              <p className="text-sm text-[#697386] mb-2">{selectedPlan.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-[#1a1f36] font-medium">Duration:</span>
                <span>{selectedPlan.duration_days} days</span>
                <span className="text-[#1a1f36] font-medium ml-6">Price:</span>
                <span className="text-2xl font-bold">{formatCurrency(selectedPlan.price)}</span>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-[#1a1f36] text-white text-lg font-semibold rounded-md shadow hover:bg-[#232946] transition"
            disabled={loading || !selectedPlanId}
          >
            {loading ? "Redirecting to Stripe..." : selectedPlan ? `Subscribe for ${formatCurrency(selectedPlan.price)}` : "Subscribe"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 