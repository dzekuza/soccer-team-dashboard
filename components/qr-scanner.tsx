"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import QrScannerLib from "qr-scanner"

interface QrScannerProps {
  onScan: (result: string) => void
}

const QrScanner = ({ onScan }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const qrScannerRef = useRef<QrScannerLib | null>(null)
  const onScanRef = useRef(onScan)
  const isInitializingRef = useRef(false)

  // Check camera permission status
  const checkCameraPermission = useCallback(async () => {
    try {
      // Check if we have stored permission preference
      const storedPermission = localStorage.getItem('camera-permission')
      if (storedPermission === 'granted') {
        setHasPermission(true)
        return true
      }
      
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setHasPermission(permission.state === 'granted')
      
      // Store permission state
      if (permission.state === 'granted') {
        localStorage.setItem('camera-permission', 'granted')
      }
      
      // Listen for permission changes
      permission.onchange = () => {
        setHasPermission(permission.state === 'granted')
        if (permission.state === 'granted') {
          localStorage.setItem('camera-permission', 'granted')
        } else {
          localStorage.removeItem('camera-permission')
        }
      }
      
      return permission.state === 'granted'
    } catch (error) {
      console.error("Error checking camera permission:", error)
      return false
    }
  }, [])

  // Initialize QR scanner
  const initializeScanner = useCallback(async () => {
    if (!videoRef.current || isInitialized || qrScannerRef.current || isInitializingRef.current) return
    
    isInitializingRef.current = true

    try {
      // Check if we already have permission
      const hasCameraPermission = await checkCameraPermission()
      
      if (!hasCameraPermission) {
        console.log("Requesting camera permission...")
      }

      // Create QR scanner instance
      const qrScanner = new QrScannerLib(
        videoRef.current,
        (result) => {
          console.log("QR Code scanned:", result.data)
          onScanRef.current(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
          returnDetailedScanResult: true,
        }
      )

      qrScannerRef.current = qrScanner

      // Start the scanner
      await qrScanner.start()
      setIsInitialized(true)
      setHasPermission(true)
      
      console.log("QR Scanner initialized successfully")
    } catch (error) {
      console.error("Failed to initialize QR scanner:", error)
      setHasPermission(false)
    } finally {
      isInitializingRef.current = false
    }
  }, [isInitialized])

  // Cleanup function
  const cleanupScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
      setIsInitialized(false)
    }
  }, [])

  // Initialize on mount - only run once
  useEffect(() => {
    initializeScanner()
    
    // Cleanup on unmount
    return () => {
      cleanupScanner()
    }
  }, []) // Empty dependency array to run only once

  // Update onScanRef when onScan prop changes
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  // Handle scanning state changes
  useEffect(() => {
    if (qrScannerRef.current) {
      if (isScanning) {
        qrScannerRef.current.start().catch(console.error)
      } else {
        qrScannerRef.current.stop()
      }
    }
  }, [isScanning])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        style={{ transform: "scaleX(-1)" }} // Mirror the video feed
      />
      
      {/* Permission denied message */}
      {hasPermission === false && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Camera Permission Required</h3>
            <p className="text-gray-600 mb-4">
              Please allow camera access to scan QR codes.
            </p>
            <button
              onClick={initializeScanner}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Grant Permission
            </button>
          </div>
        </div>
      )}
      
      {/* Processing overlay */}
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
