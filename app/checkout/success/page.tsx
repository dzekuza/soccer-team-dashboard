"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  qrCodeUrl: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const didRun = React.useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/");
      return;
    }

    // No need to fetch, just show success message
    setIsLoading(false);
  }, [searchParams, router]);

  const handleDownloadTickets = async () => {
    if (tickets.length === 0) return;
    if (tickets.length === 1) {
      // Single ticket: download PDF directly
      const res = await fetch(`/api/tickets/${tickets[0].id}/download`);
      const blob = await res.blob();
      saveAs(blob, `ticket-${tickets[0].id}.pdf`);
    } else {
      // Multiple tickets: zip PDFs
      const zip = new JSZip();
      await Promise.all(
        tickets.map(async (ticket) => {
          const res = await fetch(`/api/tickets/${ticket.id}/download`);
          const blob = await res.blob();
          zip.file(`ticket-${ticket.id}.pdf`, blob);
        })
      );
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "tickets.zip");
    }
  };

  return (
    <div className="container max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Payment Successful!</h1>
      <p className="mb-4">Thank you for your purchase. Your payment was successful.</p>
      <p className="mb-4">Your ticket(s) will be emailed to you shortly, or you can now access them below.</p>
      {isLoading && <p className="text-gray-500">Loading your tickets...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {tickets.length > 0 && (
        <div className="mt-6">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold text-lg"
            onClick={handleDownloadTickets}
          >
            Download Tickets
          </button>
        </div>
      )}
      <a href="/" className="inline-block mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Back to Home</a>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
} 