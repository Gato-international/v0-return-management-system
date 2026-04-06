"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { downloadReturnSlipPDF } from "@/lib/utils/generate-return-slip"

interface DownloadSlipButtonProps {
  returnData: {
    return_number: number | string
    qr_token: string
    customer_name: string
    customer_email: string
    customer_phone?: string
    order_number?: string
    created_at: string
    status: string
    description?: string
    preferred_resolution?: string
    items?: any[]
  }
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  fullWidth?: boolean
}

function formatReturnNumber(num: number | string): string {
  const numString = String(num)
  return `RET-${numString.padStart(6, "0")}`
}

export function DownloadSlipButton({
  returnData,
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
}: DownloadSlipButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const returnNumber = formatReturnNumber(returnData.return_number)

      await downloadReturnSlipPDF({
        returnNumber,
        qrToken: returnData.qr_token,
        customerName: returnData.customer_name,
        customerEmail: returnData.customer_email,
        customerPhone: returnData.customer_phone,
        orderNumber: returnData.order_number,
        createdAt: returnData.created_at,
        status: returnData.status,
        description: returnData.description,
        preferredResolution: returnData.preferred_resolution,
        items: (returnData.items || []).map((item: any) => ({
          product_name: item.product_name || item.variation?.product?.name || "Unknown Product",
          sku: item.variation?.sku || item.sku || "—",
          quantity: item.quantity || 1,
          reason: item.reason || "OTHER",
          condition: item.condition,
          variation: item.variation,
        })),
      })
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Download Return Slip
        </>
      )}
    </Button>
  )
}
