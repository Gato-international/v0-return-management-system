import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"
import { sendStatusUpdateEmail, sendAdminManualNotificationEmail } from "@/lib/utils/email"
import { formatReturnNumber } from "@/lib/utils/formatters"

/**
 * POST /api/v1/returns/[id]/resend
 * Resend notification emails for a return.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: returnData, error } = await supabase
      .from("returns")
      .select("customer_email, return_number, status")
      .eq("id", id)
      .single()

    if (error || !returnData) {
      return errorResponse("Return not found", 404)
    }

    const formattedReturnNumber = formatReturnNumber(returnData.return_number)

    await sendStatusUpdateEmail(
      returnData.customer_email,
      formattedReturnNumber,
      returnData.status
    )

    try {
      await sendAdminManualNotificationEmail(formattedReturnNumber, returnData.status, id)
    } catch (e) {
      // Admin email failure is non-critical
    }

    await supabase.from("audit_logs").insert({
      return_id: id,
      action: "RESEND_NOTIFICATION_VIA_API",
      details: { status: returnData.status },
    })

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
