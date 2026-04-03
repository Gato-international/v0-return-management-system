import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/settings/banner
 * Get notification banner settings.
 */
export async function GET(request: NextRequest) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("notification_banner").select("*").eq("id", 1).single()

    if (error) {
      return errorResponse("Failed to fetch banner settings")
    }

    return successResponse({ banner: data })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}

/**
 * PUT /api/v1/settings/banner
 * Update notification banner settings.
 * Body: { message?: string, color_scheme?: string, display_type?: string, is_active?: boolean, image_url?: string }
 */
export async function PUT(request: NextRequest) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const updateData: any = { updated_at: new Date().toISOString() }
    if (body.message !== undefined) updateData.message = body.message
    if (body.color_scheme !== undefined) updateData.color_scheme = body.color_scheme
    if (body.display_type !== undefined) updateData.display_type = body.display_type
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.image_url !== undefined) updateData.image_url = body.image_url

    const { error } = await supabase.from("notification_banner").update(updateData).eq("id", 1)

    if (error) {
      return errorResponse("Failed to update banner settings")
    }

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
