"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Calendar, Mail, User } from "lucide-react";

interface SubscriptionDetails {
  id: string;
  status: string;
  customer_email: string;
  start_date: string;
  end_date: string;
  purchaser_name?: string;
}

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/subscriptions/${sessionId}/verify`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to verify session");
        }

        const data = await response.json();
        setSubscriptionDetails(data);
      } catch (err) {
        setError("Failed to verify subscription session");
        console.error("Error verifying session:", err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A165B]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F15601] mx-auto"></div>
          <p className="mt-4 text-lg text-white">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A165B]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Verification Failed</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button asChild className="bg-[#F15601] hover:bg-[#E04501] text-white">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!subscriptionDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A165B]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold mb-4 text-white">Subscription Not Found</h1>
          <p className="text-gray-300 mb-6">
            We couldn&apos;t find your subscription details. This might take a few minutes to process.
          </p>
          <Button asChild className="bg-[#F15601] hover:bg-[#E04501] text-white">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A165B]">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#0A165B]/50 border border-gray-700 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4 text-white">Prenumerata sėkminga!</h1>
            <p className="text-gray-300 mb-6">
              Ačiū už prenumeratą. Jūsų prenumerata dabar aktyvi.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="border-t border-gray-700 pt-4">
              <h2 className="font-semibold mb-4 text-white">Prenumeratos informacija</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-[#F15601]" />
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm">Statusas:</span>
                    <span className="ml-2 font-medium text-white capitalize">{subscriptionDetails.status}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#F15601]" />
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm">El. paštas:</span>
                    <span className="ml-2 font-medium text-white">{subscriptionDetails.customer_email}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-[#F15601]" />
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm">Pradžios data:</span>
                    <span className="ml-2 font-medium text-white">
                      {new Date(subscriptionDetails.start_date).toLocaleDateString('lt-LT')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-[#F15601]" />
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm">Pabaigos data:</span>
                    <span className="ml-2 font-medium text-white">
                      {new Date(subscriptionDetails.end_date).toLocaleDateString('lt-LT')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-[#F15601] hover:bg-[#E04501] text-white">
              <Link href="/dashboard">Grįžti į pradžią</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-gray-600 text-white hover:bg-[#0A2065]">
              <Link href="/dashboard/subscriptions">Peržiūrėti prenumeratas</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
} 