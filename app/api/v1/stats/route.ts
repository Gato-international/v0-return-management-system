import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/stats
 * Get dashboard statistics.
 */
export async function GET(request: NextRequest) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const supabase = createAdminClient()

    const [totalRes, pendingRes, approvedRes, rejectedRes, productsRes] = await Promise.all([
      supabase.from("returns").select("*", { count: "exact", head: true }),
      supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
      supabase.from("returns").select("*", { count: "exact", head: true }).eq("status", "REJECTED"),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ])

    // Get counts by all statuses
    const { data: statusCounts } = await supabase
      .from("returns")
      .select("status")

    const statusMap: Record<string, number> = {}
    if (statusCounts) {
      for (const row of statusCounts) {
        statusMap[row.status] = (statusMap[row.status] || 0) + 1
      }
    }

    return successResponse({
      stats: {
        total_returns: totalRes.count || 0,
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        rejected: rejectedRes.count || 0,
        total_products: productsRes.count || 0,
        by_status: statusMap,
      },
    })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
