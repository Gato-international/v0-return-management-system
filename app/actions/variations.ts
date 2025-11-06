"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const variationSchema = z.object({
  productId: z.string().uuid(),
  attributes: z.record(z.string()).refine(val => Object.values(val).some(v => v), {
    message: "At least one variation attribute is required.",
  }),
})

type VariationFormData = z.infer<typeof variationSchema>

export async function createVariationAction(data: VariationFormData) {
  const validation = variationSchema.safeParse(data)
  if (!validation.success) {
    return { error: { _form: [validation.error.flatten().fieldErrors.attributes?.[0] || "Invalid data."] } }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("product_variations").insert({
    product_id: validation.data.productId,
    attributes: validation.data.attributes,
  })

  if (error) {
    console.error("Error creating variation:", error)
    if (error.message.includes("duplicate key value violates unique constraint")) {
       return { error: { _form: ["A variation with these attributes already exists."] } }
    }
    return { error: { _form: ["An unexpected error occurred."] } }
  }

  revalidatePath(`/admin/products/${validation.data.productId}`)
  return { success: true }
}

export async function updateVariationAction(variationId: string, productId: string, data: { attributes: Record<string, string> }) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("product_variations")
    .update({
      attributes: data.attributes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variationId)

  if (error) {
    console.error("Error updating variation:", error)
    if (error.message.includes("duplicate key value violates unique constraint")) {
       return { error: { _form: ["A variation with these attributes already exists."] } }
    }
    return { error: { _form: ["An unexpected error occurred."] } }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
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