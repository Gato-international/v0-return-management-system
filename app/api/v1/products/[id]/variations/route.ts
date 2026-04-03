import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * POST /api/v1/products/[id]/variations
 * Create a new variation for a product.
 * Body: { attributes: { [key: string]: string } }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id: productId } = await params
    const body = await request.json()
    const { attributes } = body

    if (!attributes || Object.keys(attributes).length === 0) {
      return errorResponse("Attributes are required", 400)
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("product_variations")
      .insert({ product_id: productId, attributes })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return errorResponse("A variation with these attributes already exists", 409)
      }
      return errorResponse("Failed to create variation")
    }

    return successResponse({ success: true, variation: data }, 201)
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
