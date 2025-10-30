"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required").regex(/^[A-Z0-9-]+$/, "SKU can only contain uppercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
})

export async function createProductAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const parsedData = productSchema.parse({
      name: formData.get("name"),
      sku: formData.get("sku"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price") as string) || undefined,
    })

    const { error } = await supabase.from("products").insert(parsedData)

    if (error) {
      if (error.code === "23505") { // Unique violation code
        return { error: "A product with this SKU already exists." }
      }
      throw error
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error creating product:", error)
    if (error instanceof z.ZodError) {
      return { error: error.errors.map(e => e.message).join(", ") }
    }
    return { error: "Failed to create product." }
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const parsedData = productSchema.parse({
      name: formData.get("name"),
      sku: formData.get("sku"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price") as string) || undefined,
    })

    const { error } = await supabase.from("products").update(parsedData).eq("id", productId)

    if (error) {
      if (error.code === "23505") { // Unique violation code
        return { error: "A product with this SKU already exists." }
      }
      throw error
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating product:", error)
    if (error instanceof z.ZodError) {
      return { error: error.errors.map(e => e.message).join(", ") }
    }
    return { error: "Failed to update product." }
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const supabase = await createClient()
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
    const supabase = await createClient()
    const { data: products, error } = await supabase.from("products").select("*").order("name", { ascending: true })

    if (error) throw error

    return { products }
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return { products: [], error: "Failed to fetch products." }
  }
}