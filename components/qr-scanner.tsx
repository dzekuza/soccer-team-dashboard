"use client"

import { useEffect, useRef } from "react"
import QrScannerLib from "qr-scanner"

interface QrScannerProps {
  onScan: (result: string) => void
}

const QrScanner = ({ onScan }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const qrScanner = new QrScannerLib(
      videoRef.current,
      (result) => {
        onScan(result.data)
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 1,
      }
    )

    qrScanner.start().catch((err) => console.error("Failed to start scanner", err))

    return () => {
      qrScanner.destroy()
    }
  }, [onScan])

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      style={{ transform: "scaleX(-1)" }} // Mirror the video feed
    />
  )
}

export default QrScanner
