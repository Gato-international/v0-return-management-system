import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * POST /api/v1/attributes/[id]/options
 * Create a new option for a variation attribute.
 * Body: { value: string }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id: attributeId } = await params
    const body = await request.json()
    const { value } = body

    if (!value) {
      return errorResponse("Value is required", 400)
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("variation_options")
      .insert({ attribute_id: attributeId, value })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return errorResponse("Option already exists for this attribute", 409)
      }
      return errorResponse("Failed to create option")
    }

    return successResponse({ success: true, option: data }, 201)
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
