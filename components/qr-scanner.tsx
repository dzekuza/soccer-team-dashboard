"use client"

import { useEffect, useRef, useState } from "react"
import QrScannerLib from "qr-scanner"
import { useToast } from "@/components/ui/use-toast"

interface QrScannerProps {
  onScan: (result: string) => void
  onValidationResult?: (result: any) => void
}

const QrScanner = ({ onScan, onValidationResult }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!videoRef.current) return

    const qrScanner = new QrScannerLib(
      videoRef.current,
      async (result) => {
        if (isScanning) return // Prevent multiple scans
        
        setIsScanning(true)
        console.log("QR Code scanned:", result.data)
        
        try {
          // QR code now contains only the ID (ticket ID or subscription ID)
          const qrData = result.data.trim();
          
          if (qrData) {
            // Validate the QR code through our API
            const response = await fetch('/api/validate-qr', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ qrData }),
            });

            const validationResult = await response.json();
            
            if (response.ok) {
              toast({
                title: "✅ Valid QR Code",
                description: validationResult.message,
              });
              
              if (onValidationResult) {
                onValidationResult(validationResult);
              }
            } else {
              toast({
                title: "❌ Invalid QR Code",
                description: validationResult.error,
                variant: "destructive",
              });
            }
          } else {
            // Fallback for empty data
            onScan(result.data);
          }
        } catch (error) {
          // If there's an error, treat as old format
          console.log("Error processing QR code data, using old format");
          onScan(result.data);
        }
        
        // Reset scanning state after a delay
        setTimeout(() => setIsScanning(false), 2000);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 1,
        returnDetailedScanResult: true,
      }
    )

    qrScanner.start().catch((err) => {
      console.error("Failed to start scanner", err)
      toast({
        title: "❌ Scanner Error",
        description: "Failed to start camera scanner",
        variant: "destructive",
      });
    })

    return () => {
      qrScanner.destroy()
    }
  }, [onScan, onValidationResult, isScanning, toast])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        style={{ transform: "scaleX(-1)" }} // Mirror the video feed
      />
      {isScanning && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-green-600 font-semibold">Apdorojamas QR kodas...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default QrScanner
