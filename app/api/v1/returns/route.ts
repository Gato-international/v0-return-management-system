import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/returns
 * List all returns with items, images, notes, and status history.
 * Query params: ?status=pending&limit=50&offset=0&since=2024-01-01T00:00:00Z
 */
export async function GET(request: NextRequest) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const since = searchParams.get("since") // ISO datetime for incremental sync

    let query = supabase
      .from("returns")
      .select(
        `
        *,
        items:return_items(
          id, return_id, product_id, product_variation_id,
          product_name, sku, quantity, reason, condition, created_at
        ),
        images:return_images(id, url, filename, created_at),
        notes:return_notes(id, note, created_by, created_at),
        status_history:return_status_history(id, status, notes, created_by, created_at)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (since) {
      query = query.gte("updated_at", since)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("[API] Error fetching returns:", error)
      return errorResponse("Failed to fetch returns")
    }

    return successResponse({ returns: data, total: count })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return errorResponse("Internal server error")
  }
}
