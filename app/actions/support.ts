"use server"

import { z } from "zod"
import { sendBugReportEmail } from "@/lib/utils/email"

const bugReportSchema = z.object({
  description: z.string().min(10, "Please provide at least 10 characters for the description."),
})

export async function sendBugReportAction(formData: FormData) {
  const description = formData.get("description") as string
  const validation = bugReportSchema.safeParse({ description })

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors.description?.[0] }
  }

  try {
    const success = await sendBugReportEmail(validation.data.description)
    if (!success) {
      return { error: "Failed to send the report. Please try again later." }
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in sendBugReportAction:", error)
    return { error: "An unexpected error occurred." }
  }
}