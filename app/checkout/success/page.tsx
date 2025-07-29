"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import { CheckCircle, Download, Mail, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    // Fetch tickets for this session with retry logic
    const fetchTickets = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tickets?session_id=${sessionId}`);
        if (!res.ok) throw new Error("Nepavyko gauti bilietų");
        const data = await res.json();
        
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
        } else if (retryCount < 3) {
          // Retry after 2 seconds if no tickets found
          setTimeout(() => fetchTickets(retryCount + 1), 2000);
          return;
        } else {
          setError("Bilietai dar nebuvo sugeneruoti. Bandykite dar kartą po kelios sekundės.");
        }
      } catch (err) {
        if (retryCount < 3) {
          // Retry after 2 seconds on error
          setTimeout(() => fetchTickets(retryCount + 1), 2000);
          return;
        }
        setError("Nepavyko gauti bilietų");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [searchParams, router]);

  const handleDownloadTickets = async () => {
    if (tickets.length === 0) return;
    setLoading(true);
    
    try {
      if (tickets.length === 1) {
        // Single ticket: download PDF directly
        const res = await fetch(`/api/tickets/${tickets[0].id}/download`);
        const blob = await res.blob();
        saveAs(blob, `bilietas-${tickets[0].id}.pdf`);
      } else {
        // Multiple tickets: zip PDFs
        const zip = new JSZip();
        await Promise.all(
          tickets.map(async (ticket) => {
            const res = await fetch(`/api/tickets/${ticket.id}/download`);
            const blob = await res.blob();
            zip.file(`bilietas-${ticket.id}.pdf`, blob);
          })
        );
        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "bilietai.zip");
      }
    } catch (err) {
      setError("Nepavyko atsisiųsti bilietų");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A165B]">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#0A165B]/50 border border-gray-700 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4 text-white">Mokėjimas sėkmingas!</h1>
            <p className="text-gray-300 mb-6">
              Ačiū už pirkimą. Jūsų mokėjimas buvo sėkmingas.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="border-t border-gray-700 pt-4">
              <h2 className="font-semibold mb-4 text-white">Bilietų informacija</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Ticket className="h-4 w-4 text-[#F15601]" />
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm">Bilietų skaičius:</span>
                    <span className="ml-2 font-medium text-white">{tickets.length}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#F15601]" />
                  <div className="flex-1">
                    <span className="text-gray-400 text-sm">El. paštu:</span>
                    <span className="ml-2 font-medium text-white">Išsiųsta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F15601] mx-auto mb-2"></div>
              <p className="text-gray-300 text-sm">Generuojami bilietai...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-700 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {tickets.length > 0 && (
            <div className="mb-6">
              <Button 
                onClick={handleDownloadTickets}
                disabled={loading}
                className="w-full bg-[#F15601] hover:bg-[#E04501] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Atsisiunčiama..." : tickets.length === 1 ? "Atsisiųsti bilietą" : `Atsisiųsti ${tickets.length} bilietus`}
              </Button>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full bg-[#F15601] hover:bg-[#E04501] text-white">
              <a href="/">Grįžti į pradžią</a>
            </Button>
            <Button variant="outline" asChild className="w-full border-gray-600 text-white hover:bg-[#0A2065]">
              <a href="/dashboard">Eiti į valdymo skydą</a>
            </Button>
          </div>
        </div>
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