import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"
import { sendStatusUpdateEmail } from "@/lib/utils/email"
import { formatReturnNumber } from "@/lib/utils/formatters"

/**
 * PUT /api/v1/returns/[id]/status
 * Update the status of a return. Sends email notification to customer.
 * Body: { status: string, notes?: string }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return errorResponse("Status is required", 400)
    }

    const supabase = createAdminClient()

    // Get current return data
    const { data: returnData, error: fetchError } = await supabase
      .from("returns")
      .select("customer_email, return_number, status")
      .eq("id", id)
      .single()

    if (fetchError || !returnData) {
      return errorResponse("Return not found", 404)
    }

    // Update the status
    const { error: updateError } = await supabase
      .from("returns")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (updateError) {
      console.error("[API] Error updating status:", updateError)
      return errorResponse("Failed to update status")
    }

    // Create status history entry
    await supabase.from("return_status_history").insert({
      return_id: id,
      status,
      notes: notes || `Status changed to ${status} via Odoo`,
    })

    // Send email notification to customer
    try {
      await sendStatusUpdateEmail(
        returnData.customer_email,
        formatReturnNumber(returnData.return_number),
        status,
        notes
      )
    } catch (emailError) {
      console.error("[API] Email notification failed:", emailError)
      // Don't fail the request if email fails
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      return_id: id,
      action: "UPDATE_STATUS_VIA_API",
      details: { old_status: returnData.status, new_status: status, notes },
    })

    return successResponse({ success: true, previous_status: returnData.status, new_status: status })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return errorResponse("Internal server error")
  }
}
