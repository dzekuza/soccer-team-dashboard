"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import QrScanner from "qr-scanner"

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanner, setScanner] = useState<QrScanner | null>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    // Check if camera is available
    QrScanner.hasCamera().then(setHasCamera)

    // Create scanner instance
    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result.data)
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    )

    setScanner(qrScanner)

    // Start scanning
    qrScanner
      .start()
      .then(() => {
        setIsScanning(true)
      })
      .catch((error) => {
        console.error("Failed to start scanner:", error)
        setHasCamera(false)
      })

    // Clean up
    return () => {
      qrScanner.destroy()
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <button
        className="absolute top-4 right-4 bg-white text-black rounded px-4 py-2 shadow-lg z-60"
        onClick={onClose}
      >
        Uždaryti
      </button>
      {hasCamera ? (
        <>
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              className="w-screen h-screen object-cover absolute inset-0"
              style={{ objectFit: "cover" }}
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-yellow-400 rounded-lg"></div>
              </div>
            )}
            <div className="absolute bottom-16 w-full flex justify-center">
              <p className="text-white text-lg bg-black/60 px-4 py-2 rounded">Nukreipkite QR kodą į rėmelį, kad nuskaitytumėte</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Kamera nepasiekiama arba nesuteiktas leidimas</p>
          <Button className="mt-4" onClick={onClose}>
            Uždaryti
          </Button>
        </div>
      )}
    </div>
  )
}
