"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  accept?: string[]
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  accept = ["image/*"],
  className,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        // Update progress
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)

        // Create FormData for upload
        const formData = new FormData()
        formData.append('file', file)

        // Upload to server
        const response = await fetch('/api/upload-product-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        uploadedUrls.push(result.url)
      }

      if (multiple) {
        const currentImages = Array.isArray(value) ? value : []
        onChange([...currentImages, ...uploadedUrls])
      } else {
        onChange(uploadedUrls[0] || "")
      }

      toast({
        title: "Sėkmingai įkelta",
        description: `${acceptedFiles.length} nuotrauka(ų) buvo įkelta`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko įkelti nuotraukos",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onChange, multiple, value, disabled, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
    maxFiles,
    disabled: disabled || uploading
  })

  const removeImage = (index: number) => {
    if (multiple && Array.isArray(value)) {
      const newImages = value.filter((_, i) => i !== index)
      onChange(newImages)
    } else {
      onChange("")
    }
  }

  const currentImages = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-[#F15601] bg-[#F15601]/10"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className={cn("h-8 w-8", isDragActive ? "text-[#F15601]" : "text-gray-400")} />
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-[#F15601] font-medium">Palikite failus čia...</p>
            ) : (
              <div>
                <p className="font-medium">
                  {multiple ? "Vilkite nuotraukas čia arba" : "Vilkite nuotrauką čia arba"}
                </p>
                <p className="text-gray-500">
                  {multiple ? "pasirinkite kelias nuotraukas" : "pasirinkite nuotrauką"}
                </p>
              </div>
            )}
          </div>
          {!isDragActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
            >
              Pasirinkti failus
            </Button>
          )}
        </div>
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#F15601] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Įkeliama... {Math.round(uploadProgress)}%</p>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {currentImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            {multiple ? "Nuotraukos" : "Nuotrauka"} ({currentImages.length})
          </h4>
          <div className={cn(
            "grid gap-4",
            multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
          )}>
            {currentImages.map((imageUrl, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <img
                      src={Array.isArray(imageUrl) ? imageUrl[0] : imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {multiple && (
                    <div className="mt-2 text-xs text-gray-500">
                      {index === 0 ? "Pagrindinė nuotrauka" : `Nuotrauka ${index + 1}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
