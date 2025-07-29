"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscriptionDetails {
  id: string;
  status: string;
  customer_email: string;
  start_date: string;
  end_date: string;
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

    // Verify the session and get subscription details
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/subscriptions/${sessionId}/verify`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to verify subscription session');
        }

        const data = await response.json();
        setSubscriptionDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify subscription');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Verifying your subscription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Verification Failed</h1>
        <p className="mb-4 text-gray-600">{error}</p>
        <Link href="/checkout/subscription">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-green-700">Subscription Successful!</h1>
        <p className="mb-6 text-gray-600">Thank you for subscribing. Your payment was successful and your subscription is now active.</p>
      </div>

      {subscriptionDetails && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
          <h2 className="text-lg font-semibold mb-4">Subscription Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600 capitalize">{subscriptionDetails.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{subscriptionDetails.customer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{new Date(subscriptionDetails.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End Date:</span>
              <span className="font-medium">{new Date(subscriptionDetails.end_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-500">You will receive a confirmation email shortly with your subscription details.</p>
        {sessionId && (
          <p className="text-xs text-gray-400">Session ID: {sessionId}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/subscriptions">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              Go to Subscriptions Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
} 