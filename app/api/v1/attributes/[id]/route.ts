import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * DELETE /api/v1/attributes/[id]
 * Delete a variation attribute with all its options.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateApiKey(request)) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase.from("variation_attributes").delete().eq("id", id)

    if (error) {
      return errorResponse("Failed to delete attribute")
    }

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
