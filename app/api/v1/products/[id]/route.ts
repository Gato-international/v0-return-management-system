import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * PUT /api/v1/products/[id]
 * Update a product.
 * Body: { name?: string, sku?: string, attributeIds?: string[] }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()
    const { name, sku, attributeIds } = body

    const supabase = createAdminClient()

    const updateData: any = { updated_at: new Date().toISOString() }
    if (name) updateData.name = name
    if (sku) updateData.sku = sku

    const { error } = await supabase.from("products").update(updateData).eq("id", id)

    if (error) {
      if (error.code === "23505") {
        return errorResponse("A product with this SKU already exists", 409)
      }
      return errorResponse("Failed to update product")
    }

    if (attributeIds !== undefined) {
      await supabase.from("product_to_variation_attributes").delete().eq("product_id", id)
      if (attributeIds.length > 0) {
        const links = attributeIds.map((attrId: string) => ({
          product_id: id,
          attribute_id: attrId,
        }))
        await supabase.from("product_to_variation_attributes").insert(links)
      }
    }

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}

/**
 * DELETE /api/v1/products/[id]
 * Delete a product.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      return errorResponse("Failed to delete product")
    }

    return successResponse({ success: true })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
