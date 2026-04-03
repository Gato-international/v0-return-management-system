import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/returns/[id]
 * Get a single return with all related data.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
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
      `
      )
      .eq("id", id)
      .single()

    if (error || !data) {
      return errorResponse("Return not found", 404)
    }

    return successResponse(data)
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return errorResponse("Internal server error")
  }
}

/**
 * DELETE /api/v1/returns/[id]
 * Delete a return and all related data (cascading).
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Log before delete
    await supabase.from("audit_logs").insert({
      return_id: id,
      action: "DELETE_RETURN_VIA_API",
      details: { message: "Return deleted via Odoo API integration" },
    })

    const { error } = await supabase.from("returns").delete().eq("id", id)

    if (error) {
      console.error("[API] Error deleting return:", error)
      return errorResponse("Failed to delete return")
    }

    return successResponse({ success: true })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return errorResponse("Internal server error")
  }
}
