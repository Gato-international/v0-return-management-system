"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendStatusUpdateEmail } from "@/lib/utils/email"

export async function updateReturnStatusAction(returnId: string, newStatus: string, notes: string, userId: string) {
  try {
    const supabase = createAdminClient()

    // Get the return to send email
    const { data: returnData } = await supabase
      .from("returns")
      .select("customer_email, return_number")
      .eq("id", returnId)
      .single()

    if (!returnData) {
      return { error: "Return not found" }
    }

    // Update the return status
    const { error: updateError } = await supabase
      .from("returns")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", returnId)

    if (updateError) throw updateError

    // Create status history
    const { error: historyError } = await supabase.from("return_status_history").insert({
      return_id: returnId,
      status: newStatus,
      notes: notes || null,
      created_by: userId,
    })

    if (historyError) throw historyError

    // Send email notification
    await sendStatusUpdateEmail(returnData.customer_email, returnData.return_number, newStatus, notes)

    // Log the action
    await supabase.from("audit_logs").insert({
      return_id: returnId,
      action: "UPDATE_RETURN_STATUS",
      details: { status: newStatus, notes },
      user_id: userId,
    })

    revalidatePath(`/admin/returns/${returnId}`)
    revalidatePath("/admin/returns")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating return status:", error)
    return { error: "Failed to update status" }
  }
}

export async function addInternalNoteAction(returnId: string, content: string, userId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("return_notes").insert({
      return_id: returnId,
      note: content,
      created_by: userId,
    })

    if (error) throw error

    // Log the action
    await supabase.from("audit_logs").insert({
      return_id: returnId,
      action: "ADD_INTERNAL_NOTE",
      details: { note: content },
      user_id: userId,
    })

    revalidatePath(`/admin/returns/${returnId}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error adding note:", error)
    return { error: "Failed to add note" }
  }
}