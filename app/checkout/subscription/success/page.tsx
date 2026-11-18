"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, Mail, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subscription {
  id: string;
  subscription_type_id: string;
  purchaser_name: string;
  purchaser_email: string;
  valid_from: string;
  valid_to: string;
  status: string;
  created_at: string;
}

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const didRun = React.useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/");
      return;
    }

    // Fetch subscription for this session
    const fetchSubscription = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/subscriptions?session_id=${sessionId}`);
        if (!res.ok) throw new Error("Nepavyko gauti prenumeratos");
        const data = await res.json();
        
        if (data.subscription) {
          setSubscription(data.subscription);
        } else if (retryCount < 3) {
          // Retry after 2 seconds if no subscription found
          setTimeout(() => fetchSubscription(retryCount + 1), 2000);
          return;
        } else {
          setError("Prenumerata dar nebuvo sukurta. Bandykite dar kartą po kelios sekundės.");
        }
      } catch (err) {
        if (retryCount < 3) {
          // Retry after 2 seconds on error
          setTimeout(() => fetchSubscription(retryCount + 1), 2000);
          return;
        }
        setError("Nepavyko gauti prenumeratos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, [searchParams, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-background/50 border border-gray-700 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4 text-white">Prenumeratos pirkimas sėkmingas!</h1>
            <p className="text-gray-300 mb-6">
              Ačiū už prenumeratos pirkimą. Jūsų prenumerata buvo aktyvuota ir galioja nuo šiandien.
            </p>
          </div>

          {isLoading && (
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-300 text-sm">Kuriama prenumerata...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-700 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {subscription && (
            <div className="space-y-4 mb-6">
              <div className="border-t border-gray-700 pt-4">
                <h2 className="font-semibold mb-4 text-white">Prenumeratos informacija</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Prenumeratos ID:</span>
                      <span className="ml-2 font-medium text-white">#{subscription.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Klientas:</span>
                      <span className="ml-2 font-medium text-white">{subscription.purchaser_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Galioja nuo:</span>
                      <span className="ml-2 font-medium text-white">{formatDate(subscription.valid_from)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Galioja iki:</span>
                      <span className="ml-2 font-medium text-white">{formatDate(subscription.valid_to)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Statusas:</span>
                      <span className="ml-2 font-medium text-white">Aktyvuota</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <span className="text-gray-400 text-sm">Patvirtinimas:</span>
                      <span className="ml-2 font-medium text-white">Išsiųstas el. paštu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-primary hover:bg-primary-strong text-white">
              <a href="/subscriptions">
                <Calendar className="h-4 w-4 mr-2" />
                Peržiūrėti prenumeratas
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full text-white border-gray-600 hover:bg-gray-700">
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Grįžti į pradžią
              </a>
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