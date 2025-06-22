"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="container max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Subscription Successful!</h1>
      <p className="mb-4">Thank you for subscribing. Your payment was successful.</p>
      <p className="mb-4">Your subscription is now active. You will receive a confirmation email shortly.</p>
      {sessionId && (
        <p className="mb-4 text-xs text-gray-500">Session ID: {sessionId}</p>
      )}
      <a href="/dashboard/subscriptions" className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go to Subscriptions Dashboard</a>
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