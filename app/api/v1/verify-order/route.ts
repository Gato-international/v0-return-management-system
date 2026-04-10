import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/v1/verify-order
 * Verifies that items in a return match the original order.
 *
 * The portal doesn't have direct PrestaShop access,
 * so we verify via the GATO Companion API (which has PS credentials).
 *
 * Body: { orderNumber: string, email: string, items: Array<{ productName: string, sku?: string, quantity: number }> }
 * Returns: { verified: boolean, matches: Array<{ product: string, found: boolean, quantityMatch: boolean }>, message: string }
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

    // Search for the order by reference in PrestaShop via companion API
    // We use a dedicated public verify endpoint that doesn't require full auth
    const searchRes = await fetch(
      `${COMPANION_API}/public/verify-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "X-Verify-Key": COMPANION_API_KEY,
        },
        body: JSON.stringify({ orderReference: orderNumber, email }),
      }
    )

    if (!searchRes.ok) {
      const errData = await searchRes.json().catch(() => ({}))
      if (searchRes.status === 404) {
        return NextResponse.json({
          verified: false,
          matches: [],
          message: "Order not found. Please check the order number and email address.",
        })
      }
      return NextResponse.json(
        { error: errData.error || "Failed to verify order" },
        { status: searchRes.status }
      )
    }

    const orderData = await searchRes.json()
    const orderRows: Array<{
      product_name: string
      product_reference: string
      quantity: number
    }> = orderData.rows || []

    // Cross-check each claimed return item against order rows
    const matches = items.map((claimedItem: any) => {
      const claimed = {
        name: (claimedItem.productName || "").toLowerCase().trim(),
        sku: (claimedItem.sku || "").toLowerCase().trim(),
        quantity: claimedItem.quantity || 1,
      }

      // Find matching order row by SKU (reference) or product name
      const match = orderRows.find((row) => {
        const rowRef = (row.product_reference || "").toLowerCase().trim()
        const rowName = (row.product_name || "").toLowerCase().trim()

        if (claimed.sku && rowRef && rowRef === claimed.sku) return true
        if (claimed.name && rowName.includes(claimed.name)) return true
        if (claimed.name && claimed.name.includes(rowName)) return true
        return false
      })

      return {
        product: claimedItem.productName || claimedItem.sku || "Unknown",
        found: !!match,
        quantityMatch: match
          ? claimed.quantity <= match.quantity
          : false,
        orderQuantity: match?.quantity || 0,
        claimedQuantity: claimed.quantity,
      }
    })

    const allFound = matches.every((m: any) => m.found)
    const allQuantitiesMatch = matches.every((m: any) => m.quantityMatch)

    let message: string
    if (allFound && allQuantitiesMatch) {
      message = "All items match the order. Everything looks correct."
    } else if (allFound && !allQuantitiesMatch) {
      message = "Items were found in the order, but some quantities exceed what was ordered."
    } else {
      const notFound = matches.filter((m: any) => !m.found).length
      message = `${notFound} item(s) could not be matched to this order.`
    }

    return NextResponse.json({
      verified: allFound && allQuantitiesMatch,
      matches,
      message,
      orderReference: orderData.reference || orderNumber,
    })
  } catch (error) {
    console.error("[verify-order] Error:", error)
    return NextResponse.json(
      { error: "Order verification failed. Please try again." },
      { status: 500 }
    )
  }
}
