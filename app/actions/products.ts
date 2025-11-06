"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define a strict schema for product data for validation.
const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long."),
  sku: z.string().min(1, "SKU is required.").regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, or hyphens."),
  has_color: z.boolean().optional(),
  has_size: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

// Action to create a new product.
export async function createProductAction(data: ProductFormData) {
  try {
    const validation = productSchema.safeParse(data)
    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors }
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("products").insert({
      name: validation.data.name,
      sku: validation.data.sku,
      has_color: validation.data.has_color ?? false,
      has_size: validation.data.has_size ?? false,
    })

    if (error) {
      if (error.code === "23505") { // Handle unique SKU constraint violation
        return { error: { sku: ["A product with this SKU already exists."] } }
      }
      console.error("Supabase error creating product:", error)
      return { error: { _form: ["A database error occurred. Please try again."] } }
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (e) {
    console.error("Unexpected error in createProductAction:", e)
    return { error: { _form: ["An unexpected error occurred."] } }
  }
}

// Action to update an existing product.
export async function updateProductAction(productId: string, data: ProductFormData) {
  try {
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
        has_color: validation.data.has_color ?? false,
        has_size: validation.data.has_size ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      if (error.code === "23505") {
        return { error: { sku: ["A product with this SKU already exists."] } }
      }
      console.error("Supabase error updating product:", error)
      return { error: { _form: ["A database error occurred. Please try again."] } }
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (e) {
    console.error("Unexpected error in updateProductAction:", e)
    return { error: { _form: ["An unexpected error occurred."] } }
  }
}

// Action to delete a product.
export async function deleteProductAction(productId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("Supabase error deleting product:", error)
      return { error: "Failed to delete product due to a database error." }
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (e) {
    console.error("Unexpected error in deleteProductAction:", e)
    return { error: "An unexpected error occurred." }
  }
}

// Action to fetch all products with their variations.
export async function getProductsAction() {
  try {
    const supabase = createAdminClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("*, variations:product_variations(*)")
      .order("name", { ascending: true })
      .order("color", { referencedTable: "product_variations", ascending: true })
      .order("size", { referencedTable: "product_variations", ascending: true })

    if (error) {
      console.error("Supabase error fetching products with variations:", error)
      return { products: [], error: "Failed to fetch products." }
    }

    return { products }
  } catch (e) {
    console.error("Unexpected error in getProductsAction:", e)
    return { products: [], error: "An unexpected error occurred." }
  }
}