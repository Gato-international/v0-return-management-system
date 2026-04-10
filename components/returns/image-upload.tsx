"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Loader2, CheckCircle, AlertTriangle, ShieldAlert, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadReturnImage } from "@/app/actions/upload"

interface ImageValidation {
  valid: boolean
  isScreenshot: boolean
  isProductPhoto: boolean
  confidence: number
  reasons: string[]
}

interface UploadedImage {
  url: string
  validation?: ImageValidation
  validating?: boolean
}

interface ImageUploadProps {
  onUpload: (url: string) => void
  onRemove: (url: string) => void
  images: string[]
  maxImages?: number
  required?: boolean
  validationResults?: Record<string, ImageValidation>
  onValidationComplete?: (url: string, result: ImageValidation) => void
}

export function ImageUpload({ onUpload, onRemove, images, maxImages = 5, required = false, validationResults = {}, onValidationComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [validatingUrls, setValidatingUrls] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const validateImage = async (url: string) => {
    setValidatingUrls(prev => new Set(prev).add(url))
    try {
      const res = await fetch("/api/v1/validate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      })
      if (res.ok) {
        const result = await res.json()
        onValidationComplete?.(url, result)
        if (!result.valid) {
          setError(
            result.isScreenshot
              ? "This appears to be a screenshot. Please upload a real photo of the product."
              : "This doesn't appear to be a product photo. Please upload a clear photo of the item."
          )
        }
      }
    } catch {
      // Validation failed silently — allow image
      onValidationComplete?.(url, { valid: true, isScreenshot: false, isProductPhoto: true, confidence: 0.5, reasons: ["Validation unavailable"] })
    } finally {
      setValidatingUrls(prev => {
        const next = new Set(prev)
        next.delete(url)
        return next
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadReturnImage(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        onUpload(result.url)
        // Trigger Vision validation in background
        validateImage(result.url)
      }
    } catch (err) {
      setError("Failed to upload image")
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const getValidationStatus = (url: string) => {
    if (validatingUrls.has(url)) return "validating"
    const v = validationResults[url]
    if (!v) return "pending"
    if (!v.valid) return "rejected"
    return "valid"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || images.length >= maxImages}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {images.length} / {maxImages} images {required && images.length === 0 && <span className="text-destructive font-medium">(at least 1 required)</span>}
        </span>
      </div>

      {required && images.length === 0 && (
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5" />
          Please upload at least one clear photo of the product you want to return.
        </p>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => {
            const status = getValidationStatus(url)
            return (
              <div key={index} className="relative group">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Return image ${index + 1}`}
                  className={`w-full h-32 object-cover rounded-lg border-2 transition-colors ${
                    status === "rejected" ? "border-red-400" :
                    status === "valid" ? "border-green-400" :
                    "border-neutral-200"
                  }`}
                />
                {/* Validation badge */}
                <div className="absolute top-2 left-2">
                  {status === "validating" && (
                    <div className="bg-white/90 rounded-full p-1 shadow-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    </div>
                  )}
                  {status === "valid" && (
                    <div className="bg-white/90 rounded-full p-1 shadow-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                  )}
                  {status === "rejected" && (
                    <div className="bg-white/90 rounded-full p-1 shadow-sm">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                    </div>
                  )}
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Rejection warning */}
                {status === "rejected" && validationResults[url] && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] px-2 py-1 rounded-b-lg">
                    {validationResults[url].isScreenshot ? "Screenshot detected" : "Not a product photo"}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
