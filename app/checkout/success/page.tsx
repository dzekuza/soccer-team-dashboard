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

    // Fetch tickets for this session
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tickets?session_id=${sessionId}`);
        if (!res.ok) throw new Error("Nepavyko gauti bilietų");
        const data = await res.json();
        setTickets(data.tickets || []);
      } catch (err) {
        setError("Nepavyko gauti bilietų");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
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
    <div className="min-h-screen bg-main flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-8 rounded-xl shadow-lg bg-white/95 text-center border border-main-border">
        <h1 className="text-3xl font-bold mb-4 text-main-orange">Mokėjimas sėkmingas!</h1>
        <p className="mb-4 text-gray-800">Ačiū už pirkimą. Jūsų mokėjimas buvo sėkmingas.</p>
        <p className="mb-4 text-gray-700">Bilietai bus išsiųsti el. paštu arba galite juos atsisiųsti žemiau.</p>
        {isLoading && <p className="text-gray-500">Įkeliami bilietai...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {tickets.length > 0 && (
          <div className="mt-6">
            <button
              className="px-6 py-3 btn-main rounded font-semibold text-lg w-full"
              onClick={handleDownloadTickets}
            >
              Atsisiųsti bilietą
            </button>
          </div>
        )}
        <a href="/" className="inline-block mt-8 px-6 py-2 btn-main rounded font-semibold">Grįžti į pradžią</a>
      </div>
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