"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QrCode, Loader2, FileDown } from "lucide-react"
import { downloadQRCode, downloadReturnSlipPDF } from "@/lib/utils/generate-return-slip"

interface DownloadQRButtonProps {
  qrToken: string
  returnNumber: string
}

export function DownloadQRButton({ qrToken, returnNumber }: DownloadQRButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await downloadQRCode(qrToken, returnNumber)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <QrCode className="mr-2 h-4 w-4" />
          Download QR Code
        </>
      )}
    </Button>
  )
}

interface AdminDownloadSlipButtonProps {
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
}

function formatReturnNumber(num: number | string): string {
  const numString = String(num)
  return `RET-${numString.padStart(6, "0")}`
}

export function AdminDownloadSlipButton({ returnData }: AdminDownloadSlipButtonProps) {
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
    <Button variant="outline" className="w-full" onClick={handleDownload} disabled={isGenerating}>
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
