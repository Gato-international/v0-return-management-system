import { NextRequest, NextResponse } from "next/server"
import { validateReturnImage } from "@/lib/vision"

/**
 * POST /api/v1/validate-image
 * Validates an uploaded image using Google Vision API.
 * Body: { imageUrl: string }
 * Returns: { valid, isScreenshot, isProductPhoto, confidence, labels, reasons }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl } = body

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      )
    }

    const result = await validateReturnImage(imageUrl)

    return NextResponse.json({
      valid: result.isValid,
      isScreenshot: result.isScreenshot,
      isProductPhoto: result.isProductPhoto,
      confidence: result.confidence,
      labels: result.labels,
      reasons: result.reasons,
    })
  } catch (error) {
    console.error("[validate-image] Error:", error)
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    )
  }
}
