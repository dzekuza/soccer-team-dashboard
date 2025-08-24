"use client"

import { useState } from "react"
import QRCode from "qrcode"

export default function TestQRPage() {
  const [qrData, setQrData] = useState("")
  const [qrImage, setQrImage] = useState("")

  const generateQR = async () => {
    if (!qrData) return
    
    try {
      const qrImageData = await QRCode.toDataURL(qrData)
      setQrImage(qrImageData)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">QR Code Test Generator</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Enter UUID (ticket or subscription ID):
          </label>
          <input
            type="text"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
            className="w-full p-2 border border-gray-300 rounded"
          />
          
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">Sample UUIDs for testing:</p>
            <div className="space-y-1">
              <button
                onClick={() => setQrData("3ac7d8ed-372b-45fa-b6bf-5e3fde26d6f5")}
                className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                Ticket: 3ac7d8ed-372b-45fa-b6bf-5e3fde26d6f5
              </button>
              <br />
              <button
                onClick={() => setQrData("2832a1bf-a7c1-4553-95c2-65012cd5553a")}
                className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                Subscription: 2832a1bf-a7c1-4553-95c2-65012cd5553a
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={generateQR}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Generate QR Code
        </button>
        
        {qrImage && (
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Generated QR Code:</h2>
            <img src={qrImage} alt="QR Code" className="mx-auto border" />
            <p className="text-sm text-gray-600 mt-2">
              Scan this QR code with the scanner app
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
