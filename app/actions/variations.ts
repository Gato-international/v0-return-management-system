"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const variationSchema = z.object({
  sku: z.string().min(1, "SKU is required.").regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, or hyphens."),
  color: z.string().optional(),
  size: z.string().optional(),
})

type VariationFormData = z.infer<typeof variationSchema>

export async function createVariationAction(productId: string, data: VariationFormData) {
  try {
    const validation = variationSchema.safeParse(data)
    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors }
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("product_variations").insert({
      product_id: productId,
      sku: validation.data.sku,
      color: validation.data.color || null,
      size: validation.data.size || null,
    })

    if (error) {
      if (error.code === "23505") {
        return { error: { sku: ["A variation with this SKU already exists."] } }
      }
      throw error
    }

    revalidatePath(`/admin/products/${productId}`)
    return { success: true }
  } catch (e) {
    console.error("Error creating variation:", e)
    return { error: { _form: ["An unexpected error occurred."] } }
  }
}

export async function updateVariationAction(variationId: string, productId: string, data: VariationFormData) {
  try {
    const validation = variationSchema.safeParse(data)
    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("product_variations")
      .update({
        sku: validation.data.sku,
        color: validation.data.color || null,
        size: validation.data.size || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variationId)

    if (error) {
      if (error.code === "23505") {
        return { error: { sku: ["A variation with this SKU already exists."] } }
      }
      throw error
    }

    revalidatePath(`/admin/products/${productId}`)
    return { success: true }
  } catch (e) {
    console.error("Error updating variation:", e)
    return { error: { _form: ["An unexpected error occurred."] } }
  }
}

export async function deleteVariationAction(variationId: string, productId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("product_variations").delete().eq("id", variationId)

    if (error) throw error

    revalidatePath(`/admin/products/${productId}`)
    return { success: true }
  } catch (e) {
    console.error("Error deleting variation:", e)
    return { error: "Failed to delete variation." }
  }
}