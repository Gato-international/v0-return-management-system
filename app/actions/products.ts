"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required").regex(/^[A-Z0-9-]+$/, "SKU can only contain uppercase letters, numbers, and hyphens"),
})

type ProductFormData = z.infer<typeof productSchema>

export async function createProductAction(data: ProductFormData) {
  try {
    const supabase = createAdminClient()
    const parsedData = productSchema.parse(data)

    const dataToInsert = {
      ...parsedData,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("products").insert(dataToInsert)

    if (error) {
      if (error.code === "23505") {
        return { error: "A product with this SKU already exists." }
      }
      throw error
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error creating product:", error)
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") }
    }
    return { error: "Failed to create product." }
  }
}

export async function updateProductAction(productId: string, data: ProductFormData) {
  try {
    const supabase = createAdminClient()
    const parsedData = productSchema.parse(data)

    const dataToUpdate = {
      ...parsedData,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("products").update(dataToUpdate).eq("id", productId)

    if (error) {
      if (error.code === "23505") {
        return { error: "A product with this SKU already exists." }
      }
      throw error
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating product:", error)
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") }
    }
    return { error: "Failed to update product." }
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) throw error

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    return { error: "Failed to delete product." }
  }
}

export async function getProductsAction() {
  try {
    const supabase = createAdminClient()
    const { data: products, error } = await supabase.from("products").select("*").order("name", { ascending: true })

    if (error) throw error

    return { products }
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return { products: [], error: "Failed to fetch products." }
  }
}