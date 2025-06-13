"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface Ticket {
  id: string;
  qrCodeUrl: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    // Fetch tickets for this session (API to be implemented)
    fetch(`/api/checkout/tickets?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        } else {
          setError(data.error || "No tickets found.");
        }
      })
      .catch(() => setError("Failed to fetch tickets."))
      .finally(() => setLoading(false));
  }, [sessionId]);

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
    <div className="max-w-lg mx-auto p-8 mt-16 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Payment Successful!</h1>
      <p className="mb-4">Thank you for your purchase. Your payment was successful.</p>
      <p className="mb-4">Your ticket(s) will be emailed to you shortly, or you can now access them below.</p>
      {sessionId && (
        <p className="mb-4 text-xs text-gray-500">Session ID: {sessionId}</p>
      )}
      {loading && <p className="text-gray-500">Loading your tickets...</p>}
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