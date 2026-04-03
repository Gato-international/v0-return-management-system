import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/attributes
 * List all variation attributes with their options.
 */
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse()

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("variation_attributes")
      .select("*, options:variation_options(*)")
      .order("name")

    if (error) {
      return errorResponse("Failed to fetch attributes")
    }

    return successResponse({ attributes: data })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}

/**
 * POST /api/v1/attributes
 * Create a new variation attribute.
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return errorResponse("Name is required", 400)
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("variation_attributes")
      .insert({ name })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return errorResponse("Attribute already exists", 409)
      }
      return errorResponse("Failed to create attribute")
    }

    return successResponse({ success: true, attribute: data }, 201)
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
