import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/products
 * List all products with variations and linked attributes.
 */
export async function GET(request: NextRequest) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        variations:product_variations(id, product_id, attributes, created_at, updated_at),
        linked_attributes:product_to_variation_attributes(attribute_id)
      `
      )
      .order("name", { ascending: true })

    if (error) {
      console.error("[API] Error fetching products:", error)
      return errorResponse("Failed to fetch products")
    }

    return successResponse({ products: data })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}

/**
 * POST /api/v1/products
 * Create a new product.
 * Body: { name: string, sku: string, attributeIds?: string[] }
 */
export async function POST(request: NextRequest) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { name, sku, attributeIds } = body

    if (!name || !sku) {
      return errorResponse("Name and SKU are required", 400)
    }

    const supabase = createAdminClient()

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert({ name, sku })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return errorResponse("A product with this SKU already exists", 409)
      }
      return errorResponse("Failed to create product")
    }

    if (attributeIds && attributeIds.length > 0) {
      const links = attributeIds.map((attrId: string) => ({
        product_id: newProduct.id,
        attribute_id: attrId,
      }))
      await supabase.from("product_to_variation_attributes").insert(links)
    }

    return successResponse({ success: true, product: newProduct }, 201)
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
