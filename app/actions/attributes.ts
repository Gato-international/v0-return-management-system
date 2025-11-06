"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const attributeSchema = z.object({
  name: z.string().min(1, "Name is required."),
})

const optionSchema = z.object({
  attributeId: z.string().uuid(),
  value: z.string().min(1, "Value is required."),
})

export async function getAttributesWithOptions() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("variation_attributes")
    .select("*, options:variation_options(*)")
    .order("name")
    .order("value", { foreignTable: "variation_options" })

  if (error) {
    console.error("Error fetching attributes:", error)
    return { error: "Failed to fetch attributes." }
  }
  return { attributes: data }
}

export async function createAttributeAction(formData: FormData) {
  const name = formData.get("name") as string
  const validation = attributeSchema.safeParse({ name })
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("variation_attributes").insert({ name: validation.data.name })

  if (error) {
    if (error.code === "23505") return { error: { name: ["Attribute already exists."] } }
    return { error: { _form: ["Database error."] } }
  }
  revalidatePath("/admin/variations")
  return { success: true }
}

export async function deleteAttributeAction(attributeId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("variation_attributes").delete().eq("id", attributeId)
  if (error) return { error: "Failed to delete attribute." }
  revalidatePath("/admin/variations")
  return { success: true }
}

export async function createOptionAction(formData: FormData) {
  const attributeId = formData.get("attributeId") as string
  const value = formData.get("value") as string
  const validation = optionSchema.safeParse({ attributeId, value })
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("variation_options").insert({ attribute_id: attributeId, value })

  if (error) {
    if (error.code === "23505") return { error: { value: ["Option already exists for this attribute."] } }
    return { error: { _form: ["Database error."] } }
  }
  revalidatePath("/admin/variations")
  return { success: true }
}

export async function deleteOptionAction(optionId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("variation_options").delete().eq("id", optionId)
  if (error) return { error: "Failed to delete option." }
  revalidatePath("/admin/variations")
  return { success: true }
}