"use client"

import { useEffect, useRef, useState } from "react"
import QrScannerLib from "qr-scanner"

interface QrScannerProps {
  onScan: (result: string) => void
}

const QrScanner = ({ onScan }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    const qrScanner = new QrScannerLib(
      videoRef.current,
      (result) => {
        console.log("QR Code scanned:", result.data)
        
        // Simply pass the scanned data to the parent component
        onScan(result.data)
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
    })

    return () => {
      qrScanner.destroy()
    }
  }, [onScan, isScanning])

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
