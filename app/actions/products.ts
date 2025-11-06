"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long."),
  sku: z.string().min(1, "SKU is required.").regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, or hyphens."),
  attributeIds: z.array(z.string().uuid()).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export async function createProductAction(data: ProductFormData) {
  const validation = productSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = createAdminClient()
  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert({ name: validation.data.name, sku: validation.data.sku })
    .select()
    .single()

  if (productError) {
    if (productError.code === "23505") return { error: { sku: ["A product with this SKU already exists."] } }
    return { error: { _form: ["A database error occurred creating the product."] } }
  }

  if (validation.data.attributeIds && validation.data.attributeIds.length > 0) {
    const attributesToLink = validation.data.attributeIds.map(attrId => ({
      product_id: newProduct.id,
      attribute_id: attrId,
    }))
    const { error: linkError } = await supabase.from("product_to_variation_attributes").insert(attributesToLink)
    if (linkError) {
      return { error: { _form: ["A database error occurred linking attributes."] } }
    }
  }

  revalidatePath("/admin/products")
  return { success: true }
}

export async function updateProductAction(productId: string, data: ProductFormData) {
  const validation = productSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("products")
    .update({
      name: validation.data.name,
      sku: validation.data.sku,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (error) {
    if (error.code === "23505") return { error: { sku: ["A product with this SKU already exists."] } }
    return { error: { _form: ["A database error occurred updating the product."] } }
  }

  const { error: deleteError } = await supabase.from("product_to_variation_attributes").delete().eq("product_id", productId)
  if (deleteError) {
    return { error: { _form: ["A database error occurred updating attributes."] } }
  }

  if (validation.data.attributeIds && validation.data.attributeIds.length > 0) {
    const attributesToLink = validation.data.attributeIds.map(attrId => ({
      product_id: productId,
      attribute_id: attrId,
    }))
    const { error: linkError } = await supabase.from("product_to_variation_attributes").insert(attributesToLink)
    if (linkError) {
      return { error: { _form: ["A database error occurred linking new attributes."] } }
    }
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function deleteProductAction(productId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)
    if (error) throw error
    revalidatePath("/admin/products")
    return { success: true }
  } catch (e) {
    return { error: "An unexpected error occurred." }
  }
}

export async function getProductsAction() {
  try {
    const supabase = createAdminClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("*, variations:product_variations(*), attributes:product_to_variation_attributes(attribute_id)")
      .order("name", { ascending: true })

    if (error) {
      console.error("Supabase error fetching products:", error)
      return { products: [], error: "Failed to fetch products." }
    }
    return { products }
  } catch (e) {
    return { products: [], error: "An unexpected error occurred." }
  }
}