"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createVariationSchema = z.object({
  productId: z.string().uuid(),
  attributes: z.record(z.string()),
})

type CreateVariationFormData = z.infer<typeof createVariationSchema>

export async function createVariationAction(data: CreateVariationFormData) {
  const validation = createVariationSchema.safeParse(data)
  if (!validation.success) {
    return { error: { _form: ["Invalid data submitted."] } }
  }

  const { productId, attributes } = validation.data
  const supabase = createAdminClient()

  // Server-side check: Ensure all attributes for the product are provided and valid
  const { data: productAttributesData, error: attrError } = await supabase
    .from("product_to_variation_attributes")
    .select("attribute:variation_attributes(name)")
    .eq("product_id", productId)

  if (attrError) {
    console.error("Error fetching product attributes for validation:", attrError)
    return { error: { _form: ["Could not verify product attributes."] } }
  }

  const requiredAttributeNames = productAttributesData?.map(item => item.attribute.name) || []

  if (requiredAttributeNames.length === 0) {
    return { error: { _form: ["This product has no attributes linked. Cannot create variations."] } }
  }

  for (const name of requiredAttributeNames) {
    if (!attributes[name] || attributes[name].trim() === "") {
      return { error: { _form: [`Missing value for attribute: ${name}`] } }
    }
  }

  // Now, insert into the database
  const { error } = await supabase.from("product_variations").insert({
    product_id: productId,
    attributes: attributes,
  })

  if (error) {
    console.error("Error creating variation:", error)
    if (error.code === "23505" || error.message.includes("duplicate key value violates unique constraint")) {
      return { error: { _form: ["A variation with these attributes already exists."] } }
    }
    return { error: { _form: ["An unexpected error occurred while creating the variation."] } }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

const updateVariationSchema = z.object({
  attributes: z.record(z.string()),
})

export async function updateVariationAction(variationId: string, productId: string, data: z.infer<typeof updateVariationSchema>) {
  const validation = updateVariationSchema.safeParse(data)
  if (!validation.success) {
    return { error: { _form: ["Invalid data submitted."] } }
  }
  
  const { attributes } = validation.data
  const supabase = createAdminClient()

  // Similar validation as create
  const { data: productAttributesData, error: attrError } = await supabase
    .from("product_to_variation_attributes")
    .select("attribute:variation_attributes(name)")
    .eq("product_id", productId)

  if (attrError) {
    return { error: { _form: ["Could not verify product attributes."] } }
  }

  const requiredAttributeNames = productAttributesData?.map(item => item.attribute.name) || []

  for (const name of requiredAttributeNames) {
    if (!attributes[name] || attributes[name].trim() === "") {
      return { error: { _form: [`Missing value for attribute: ${name}`] } }
    }
  }

  const { error } = await supabase
    .from("product_variations")
    .update({
      attributes: attributes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variationId)

  if (error) {
    console.error("Error updating variation:", error)
    if (error.code === "23505" || error.message.includes("duplicate key value violates unique constraint")) {
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