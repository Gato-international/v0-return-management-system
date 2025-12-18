"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const releaseNoteSchema = z.object({
  version: z.string().min(1, "Version is required."),
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  release_date: z.string().min(1, "Release date is required."),
  category: z.enum(["feature", "improvement", "bugfix", "announcement"]),
  is_published: z.boolean(),
})

type ReleaseNoteFormData = z.infer<typeof releaseNoteSchema>

export async function getPublishedReleaseNotesAction() {
  try {
    const supabase = createAdminClient()
    const { data: notes, error } = await supabase
      .from("release_notes")
      .select("*")
      .eq("is_published", true)
      .order("release_date", { ascending: false })

    if (error) {
      console.error("Error fetching release notes:", error)
      return { notes: [], error: "Failed to fetch release notes" }
    }

    return { notes: notes || [] }
  } catch (error) {
    console.error("Error in getPublishedReleaseNotesAction:", error)
    return { notes: [], error: "An unexpected error occurred" }
  }
}

export async function getAllReleaseNotesAction() {
  try {
    await requireAuth()
    const supabase = createAdminClient()
    const { data: notes, error } = await supabase
      .from("release_notes")
      .select("*")
      .order("release_date", { ascending: false })

    if (error) {
      console.error("Error fetching all release notes:", error)
      return { notes: [], error: "Failed to fetch release notes" }
    }

    return { notes: notes || [] }
  } catch (error) {
    console.error("Error in getAllReleaseNotesAction:", error)
    return { notes: [], error: "An unexpected error occurred" }
  }
}

export async function createReleaseNoteAction(data: ReleaseNoteFormData) {
  try {
    const user = await requireAuth()
    const validation = releaseNoteSchema.safeParse(data)
    
    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors }
    }

    const supabase = createAdminClient()
    const { data: note, error } = await supabase
      .from("release_notes")
      .insert({
        ...validation.data,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating release note:", error)
      return { error: { _form: ["Failed to create release note"] } }
    }

    revalidatePath("/release-notes")
    revalidatePath("/admin/release-notes")
    return { success: true, note }
  } catch (error) {
    console.error("Error in createReleaseNoteAction:", error)
    return { error: { _form: ["An unexpected error occurred"] } }
  }
}

export async function updateReleaseNoteAction(id: string, data: ReleaseNoteFormData) {
  try {
    await requireAuth()
    const validation = releaseNoteSchema.safeParse(data)
    
    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("release_notes")
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating release note:", error)
      return { error: { _form: ["Failed to update release note"] } }
    }

    revalidatePath("/release-notes")
    revalidatePath("/admin/release-notes")
    return { success: true }
  } catch (error) {
    console.error("Error in updateReleaseNoteAction:", error)
    return { error: { _form: ["An unexpected error occurred"] } }
  }
}

export async function deleteReleaseNoteAction(id: string) {
  try {
    await requireAuth()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("release_notes")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting release note:", error)
      return { error: "Failed to delete release note" }
    }

    revalidatePath("/release-notes")
    revalidatePath("/admin/release-notes")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteReleaseNoteAction:", error)
    return { error: "An unexpected error occurred" }
  }
}
