import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * PUT /api/v1/variations/[id]
 * Update a variation's attributes.
 * Body: { attributes: { [key: string]: string } }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateApiKey(request)) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()
    const { attributes } = body

    if (!attributes) {
      return errorResponse("Attributes are required", 400)
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from("product_variations")
      .update({ attributes, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return errorResponse("Failed to update variation")
    }

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}

/**
 * DELETE /api/v1/variations/[id]
 * Delete a variation.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateApiKey(request)) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase.from("product_variations").delete().eq("id", id)

    if (error) {
      return errorResponse("Failed to delete variation")
    }

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
