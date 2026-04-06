import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/returns/scan/[token]
 *
 * Lookup a return by its QR token. Used by warehouse staff (GATO Companion app)
 * when scanning the QR code on a return slip.
 *
 * Requires API key authentication (internal use only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { token } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(token)) {
      return errorResponse("Invalid QR token format", 400)
    }

    const supabase = createAdminClient()

    // Look up the return by qr_token
    const { data: returnData, error: returnError } = await supabase
      .from("returns")
      .select("*")
      .eq("qr_token", token)
      .single()

    if (returnError || !returnData) {
      return errorResponse("Return not found for this QR code", 404)
    }

    // Fetch related data
    const [
      { data: items },
      { data: statusHistory },
      { data: notes },
      { data: images },
    ] = await Promise.all([
      supabase.from("return_items").select("*").eq("return_id", returnData.id),
      supabase
        .from("return_status_history")
        .select("*")
        .eq("return_id", returnData.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("return_notes")
        .select("*")
        .eq("return_id", returnData.id)
        .order("created_at", { ascending: false }),
      supabase.from("return_images").select("*").eq("return_id", returnData.id),
    ])

    // Enrich items with variation data
    const enrichedItems = items || []
    if (enrichedItems.length > 0) {
      const variationIds = enrichedItems
        .map((item: any) => item.product_variation_id)
        .filter(Boolean)

      if (variationIds.length > 0) {
        const { data: variations } = await supabase
          .from("product_variations")
          .select("id, sku, attributes, product:products(name)")
          .in("id", variationIds)

        if (variations) {
          const variationsMap = new Map(variations.map((v: any) => [v.id, v]))
          enrichedItems.forEach((item: any) => {
            if (item.product_variation_id) {
              item.variation = variationsMap.get(item.product_variation_id)
            }
          })
        }
      }
    }

    return successResponse({
      ...returnData,
      items: enrichedItems,
      status_history: statusHistory || [],
      notes: notes || [],
      images: images || [],
    })
  } catch (error) {
    console.error("[v0] Error looking up return by QR token:", error)
    return errorResponse("Internal server error")
  }
}
