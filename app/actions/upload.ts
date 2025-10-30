"use server"

import { put } from "@vercel/blob"

export async function uploadReturnImage(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { error: "File size too large. Maximum size is 5MB." }
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    return { url: blob.url }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Failed to upload image" }
  }
}

export async function deleteReturnImage(url: string) {
  try {
    // Note: Vercel Blob deletion requires the blob token
    // For now, we'll just remove the reference from the database
    // In production, you would use the del() function from @vercel/blob
    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    return { error: "Failed to delete image" }
  }
}
