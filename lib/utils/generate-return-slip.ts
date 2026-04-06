"use client"

import { jsPDF } from "jspdf"
import QRCode from "qrcode"

interface ReturnItem {
  product_name: string
  sku: string
  quantity: number
  reason: string
  condition?: string
  variation?: {
    sku?: string
    attributes?: Record<string, string>
    product?: { name: string }
  }
}

interface ReturnSlipData {
  returnNumber: string
  qrToken: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderNumber?: string
  createdAt: string
  status: string
  description?: string
  preferredResolution?: string
  items: ReturnItem[]
}

const PORTAL_URL = "https://return.gato-international.com"

/**
 * Generate QR code as a data URL (PNG base64).
 */
async function generateQRDataUrl(data: string, size: number = 200): Promise<string> {
  return QRCode.toDataURL(data, {
    width: size,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "H",
  })
}

/**
 * Generate just the QR code as a downloadable PNG blob.
 */
export async function generateQRCodeBlob(qrToken: string): Promise<Blob> {
  const url = `${PORTAL_URL}/api/v1/returns/scan/${qrToken}`
  const canvas = document.createElement("canvas")
  await QRCode.toCanvas(canvas, url, {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "H",
  })
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png")
  })
}

/**
 * Download QR code as a standalone PNG image.
 */
export async function downloadQRCode(qrToken: string, returnNumber: string) {
  const blob = await generateQRCodeBlob(qrToken)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `QR-${returnNumber}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Draw a horizontal line across the page.
 */
function drawLine(doc: jsPDF, y: number, marginLeft: number, marginRight: number) {
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(marginLeft, y, 210 - marginRight, y)
}

/**
 * Draw a thick separator line.
 */
function drawThickLine(doc: jsPDF, y: number, marginLeft: number, marginRight: number) {
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.line(marginLeft, y, 210 - marginRight, y)
}

/**
 * Format a reason string for display.
 */
function formatReason(reason: string): string {
  return reason.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format a resolution string for display.
 */
function formatResolution(resolution: string): string {
  return resolution.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format date for display on the slip.
 */
function formatSlipDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

/**
 * Generate a modern, black & white return slip PDF.
 */
export async function generateReturnSlipPDF(data: ReturnSlipData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = 210
  const marginL = 20
  const marginR = 20
  const contentWidth = pageWidth - marginL - marginR
  let y = 0

  // ─── Black header bar ───
  doc.setFillColor(0, 0, 0)
  doc.rect(0, 0, pageWidth, 38, "F")

  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text("GATO INTERNATIONAL", marginL, 16)

  // Subtitle
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text("RETURN SLIP", marginL, 24)

  // Return number in header (right side)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(data.returnNumber, pageWidth - marginR, 16, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("Place this slip inside your return package", pageWidth - marginR, 24, { align: "right" })

  // Thin accent line below header
  doc.setFillColor(80, 80, 80)
  doc.rect(0, 38, pageWidth, 1.5, "F")

  y = 50

  // ─── QR Code + Return Info side by side ───
  const qrUrl = `${PORTAL_URL}/api/v1/returns/scan/${data.qrToken}`
  const qrDataUrl = await generateQRDataUrl(qrUrl, 300)

  // QR Code on the left
  const qrSize = 42
  doc.addImage(qrDataUrl, "PNG", marginL, y, qrSize, qrSize)

  // Border around QR
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.4)
  doc.rect(marginL - 1, y - 1, qrSize + 2, qrSize + 2)

  // Return info on the right of QR
  const infoX = marginL + qrSize + 12
  const infoWidth = contentWidth - qrSize - 12

  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("RETURN NUMBER", infoX, y + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(data.returnNumber, infoX, y + 10)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("DATE SUBMITTED", infoX, y + 18)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(formatSlipDate(data.createdAt), infoX, y + 24)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("STATUS", infoX, y + 32)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(data.status.replace(/_/g, " ").toUpperCase(), infoX, y + 38)

  y += qrSize + 8

  // ─── Customer information ───
  drawThickLine(doc, y, marginL, marginR)
  y += 7

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text("CUSTOMER INFORMATION", marginL, y)
  y += 6

  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  // Two column layout for customer info
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(120, 120, 120)
  doc.text("Name", marginL, y)
  doc.text("Email", marginL + contentWidth / 2, y)
  y += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(data.customerName || "—", marginL, y)
  doc.text(data.customerEmail || "—", marginL + contentWidth / 2, y)
  y += 6

  if (data.customerPhone || data.orderNumber) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(120, 120, 120)
    if (data.customerPhone) doc.text("Phone", marginL, y)
    if (data.orderNumber) doc.text("Order Number", marginL + contentWidth / 2, y)
    y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    if (data.customerPhone) doc.text(data.customerPhone, marginL, y)
    if (data.orderNumber) doc.text(data.orderNumber, marginL + contentWidth / 2, y)
    y += 6
  }

  y += 4

  // ─── Items section ───
  drawThickLine(doc, y, marginL, marginR)
  y += 7

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text("ITEMS TO RETURN", marginL, y)
  y += 3

  // Table header
  y += 5
  doc.setFillColor(245, 245, 245)
  doc.rect(marginL, y - 4, contentWidth, 7, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text("PRODUCT", marginL + 2, y)
  doc.text("SKU", marginL + 90, y)
  doc.text("QTY", marginL + 125, y)
  doc.text("REASON", marginL + 140, y)
  y += 6

  // Table rows
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    const productName = item.variation?.product?.name || item.product_name
    const sku = item.variation?.sku || item.sku
    const reason = formatReason(item.reason)

    // Check if we need a new page
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    // Alternate row background
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(marginL, y - 4, contentWidth, 12, "F")
    }

    // Truncate long product names
    const maxNameWidth = 85
    let displayName = productName
    while (doc.getStringUnitWidth(displayName) * 9 / doc.internal.scaleFactor > maxNameWidth && displayName.length > 3) {
      displayName = displayName.slice(0, -4) + "..."
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(displayName, marginL + 2, y)
    doc.text(sku || "—", marginL + 90, y)
    doc.text(String(item.quantity), marginL + 125, y)

    // Truncate reason if needed
    let displayReason = reason
    while (doc.getStringUnitWidth(displayReason) * 9 / doc.internal.scaleFactor > 28 && displayReason.length > 3) {
      displayReason = displayReason.slice(0, -4) + "..."
    }
    doc.text(displayReason, marginL + 140, y)
    y += 5

    // Variation attributes (if any)
    if (item.variation?.attributes) {
      const attrText = Object.entries(item.variation.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join("  |  ")
      doc.setFontSize(7.5)
      doc.setTextColor(120, 120, 120)
      doc.text(attrText, marginL + 4, y)
      doc.setTextColor(0, 0, 0)
      y += 5
    } else {
      y += 3
    }

    // Light separator between items
    if (i < data.items.length - 1) {
      drawLine(doc, y, marginL + 2, marginR + 2)
      y += 3
    }
  }

  y += 6

  // ─── Resolution ───
  if (data.preferredResolution) {
    drawLine(doc, y, marginL, marginR)
    y += 6
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.setTextColor(120, 120, 120)
    doc.text("PREFERRED RESOLUTION", marginL, y)
    y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(formatResolution(data.preferredResolution), marginL, y)
    y += 8
  }

  // ─── Return Instructions Box ───
  if (y > 230) {
    doc.addPage()
    y = 20
  }

  drawThickLine(doc, y, marginL, marginR)
  y += 7

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text("RETURN INSTRUCTIONS", marginL, y)
  y += 7

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(40, 40, 40)

  const instructions = [
    "1.  Print this return slip and place it inside your return package.",
    "2.  Pack all items securely to prevent damage during shipping.",
    "3.  Ensure the QR code above is visible and not damaged.",
    "4.  Ship the package to the address provided in your confirmation email.",
    "5.  You can track your return status at return.gato-international.com",
  ]

  for (const line of instructions) {
    doc.text(line, marginL + 2, y)
    y += 5.5
  }

  y += 6

  // ─── Warehouse section (dashed border) ───
  if (y > 245) {
    doc.addPage()
    y = 20
  }

  // Dashed separator
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(marginL, y, pageWidth - marginR, y)
  doc.setLineDashPattern([], 0) // Reset dash
  y += 4

  // Scissors icon text
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text("✂  - - - - - - - - - - - - - - - - - - WAREHOUSE USE ONLY - - - - - - - - - - - - - - - - - -  ✂", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.text("INTERNAL REFERENCE", marginL, y)
  y += 5

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(60, 60, 60)
  doc.text(`Return: ${data.returnNumber}`, marginL, y)
  doc.text(`Items: ${data.items.length}`, marginL + 60, y)
  doc.text(`Resolution: ${formatResolution(data.preferredResolution || "N/A")}`, marginL + 90, y)
  y += 5
  doc.text(`Scan QR code above to process this return in the warehouse system.`, marginL, y)

  // ─── Footer ───
  const footerY = 285
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(marginL, footerY - 4, pageWidth - marginR, footerY - 4)

  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.setFont("helvetica", "normal")
  doc.text("Gato International B.V.  |  return.gato-international.com", pageWidth / 2, footerY, { align: "center" })
  doc.text(`Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, footerY + 4, { align: "center" })

  return doc
}

/**
 * Generate and trigger download of the return slip PDF.
 */
export async function downloadReturnSlipPDF(data: ReturnSlipData) {
  const doc = await generateReturnSlipPDF(data)
  doc.save(`Return-Slip-${data.returnNumber}.pdf`)
}
