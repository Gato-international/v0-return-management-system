"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendStatusUpdateEmail, sendAdminManualNotificationEmail } from "@/lib/utils/email"
import { redirect } from "next/navigation"
import { formatReturnNumber } from "@/lib/utils/formatters"

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
    await sendStatusUpdateEmail(returnData.customer_email, formatReturnNumber(returnData.return_number), newStatus, notes)

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

export async function deleteReturnAction(returnId: string, userId: string) {
  try {
    const supabase = createAdminClient()

    // Log the action first
    await supabase.from("audit_logs").insert({
      return_id: returnId,
      action: "DELETE_RETURN",
      details: { message: "Return request deleted by admin" },
      user_id: userId,
    })

    // Delete the return (cascading deletes will handle related data)
    const { error } = await supabase.from("returns").delete().eq("id", returnId)

    if (error) throw error

    revalidatePath("/admin/returns")
    revalidatePath("/admin/dashboard")
  } catch (error) {
    console.error("[v0] Error deleting return:", error)
    return { error: "Failed to delete return request" }
  }

  // Redirect to the returns list after successful deletion
  redirect("/admin/returns")
}

export async function resendNotificationAction(returnId: string, userId: string) {
  try {
    const supabase = createAdminClient()

    const { data: returnData, error } = await supabase
      .from("returns")
      .select("customer_email, return_number, status")
      .eq("id", returnId)
      .single()

    if (error || !returnData) {
      return { error: "Return not found." }
    }

    const formattedReturnNumber = formatReturnNumber(returnData.return_number)

    // Send status update to customer
    const customerEmailSent = await sendStatusUpdateEmail(returnData.customer_email, formattedReturnNumber, returnData.status)
    if (!customerEmailSent) {
      return { error: "Failed to send notification to customer." }
    }

    // Send notification to admin
    const adminEmailSent = await sendAdminManualNotificationEmail(formattedReturnNumber, returnData.status, returnId)
    if (!adminEmailSent) {
      // Log this but don't fail the whole operation if only the admin email fails
      console.error("[v0] Failed to send notification to admin, but customer email was successful.")
    }

    // Log the action
    await supabase.from("audit_logs").insert({
      return_id: returnId,
      action: "RESEND_NOTIFICATION",
      details: { message: `Notification for status '${returnData.status}' resent.` },
      user_id: userId,
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error resending notification:", error)
    return { error: "Failed to resend notification." }
  }
}