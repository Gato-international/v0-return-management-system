import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/v1/verify-order
 * Verifies that items in a return match the original order.
 *
 * The portal doesn't have direct PrestaShop/Odoo access,
 * so verification is done entirely server-side by the GATO Companion API.
 * Only a pass/fail result is returned — no order details are exposed.
 *
 * Body: { orderNumber: string, email: string, items: Array<{ productName: string, sku?: string, quantity: number }> }
 * Returns: { verified: boolean, message: string }
 */

const COMPANION_API = process.env.COMPANION_API_URL || "https://filomena-basipetal-unnationalistically.ngrok-free.dev"
const COMPANION_API_KEY = process.env.COMPANION_VERIFY_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber, email, items } = body

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required" },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required for verification" },
        { status: 400 }
      )
    }

    // Send everything to companion API — it does the cross-checking
    // against both PrestaShop and Odoo, returns only pass/fail
    const searchRes = await fetch(
      `${COMPANION_API}/public/verify-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "X-Verify-Key": COMPANION_API_KEY,
        },
        body: JSON.stringify({
          orderReference: orderNumber,
          email,
          items,
        }),
      }
    )

    if (!searchRes.ok) {
      const errData = await searchRes.json().catch(() => ({}))
      if (searchRes.status === 404) {
        return NextResponse.json({
          verified: false,
          message: "Order not found. Please check the order number and email address.",
        })
      }
      return NextResponse.json(
        { error: errData.error || "Failed to verify order" },
        { status: searchRes.status }
      )
    }

    const result = await searchRes.json()

    // Return only verified boolean and message — no order details
    return NextResponse.json({
      verified: !!result.verified,
      message: result.message || (result.verified ? "Order verified." : "Verification failed."),
    })
  } catch (error) {
    console.error("[verify-order] Error:", error)
    return NextResponse.json(
      { error: "Order verification failed. Please try again." },
      { status: 500 }
    )
  }
}
