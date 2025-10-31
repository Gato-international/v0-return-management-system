"use server"

import { createClient } from "@/lib/supabase/server"
import { sendReturnConfirmationEmail } from "@/lib/utils/email"
import { revalidatePath } from "next/cache"
import { formatReturnNumber } from "@/lib/utils/formatters"
import { sql } from "@supabase/supabase-js" // Import the sql helper

interface ReturnItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  reason: string
  condition?: string
}

interface SubmitReturnData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderNumber?: string
  orderDate?: string
  description: string
  preferredResolution: string
  items: ReturnItem[]
  images?: string[]
}

export async function submitReturnAction(data: SubmitReturnData) {
  try {
    console.log("[v0] Submitting return with data:", data)
    const supabase = await createClient()

    // Create a summary of reasons from all items.
    // This provides a general reason for the return record,
    // satisfying the schema constraint if it exists, while details remain per-item.
    const reasonSummary =
      data.items.length > 0
        ? `Return for ${data.items.length} item(s). Reasons include: ${[
            ...new Set(data.items.map((item) => item.reason.replace(/_/g, " "))),
          ].join(", ")}`
        : "General return request"

    const { data: returnRecord, error: returnError } = await supabase
      .from("returns")
      .insert({
        return_number: sql`nextval('returns_return_number_seq')`, // Explicitly use the sequence
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone || null,
        order_number: data.orderNumber || null,
        order_date: data.orderDate || null,
        reason: reasonSummary, // Add the summary reason to satisfy the constraint
        description: data.description,
        preferred_resolution: data.preferredResolution,
        status: "pending",
      })
      .select()
      .single()

    if (returnError) {
      console.error("[v0] Error creating return:", returnError)
      throw returnError
    }

    console.log("[v0] Return created:", returnRecord)

    const itemsToInsert = data.items.map((item) => ({
      return_id: returnRecord.id,
      product_id: item.productId,
      product_name: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      reason: item.reason,
      condition: item.condition || null,
    }))

    const { error: itemsError } = await supabase.from("return_items").insert(itemsToInsert)

    if (itemsError) {
      console.error("[v0] Error creating items:", itemsError)
      throw itemsError
    }

    const { error: historyError } = await supabase.from("return_status_history").insert({
      return_id: returnRecord.id,
      status: "pending",
      notes: "Return request submitted by customer",
    })

    if (historyError) {
      console.error("[v0] Error creating history:", historyError)
      throw historyError
    }

    if (data.images && data.images.length > 0) {
      const imagesToInsert = data.images.map((url, index) => ({
        return_id: returnRecord.id,
        url,
        filename: `image-${index + 1}.jpg`,
      }))

      const { error: imagesError } = await supabase.from("return_images").insert(imagesToInsert)

      if (imagesError) {
        console.error("[v0] Error creating images:", imagesError)
        throw imagesError
      }
    }

    // Use the auto-generated return_number from the database and format it
    const formattedReturnNumber = formatReturnNumber(returnRecord.return_number);
    await sendReturnConfirmationEmail(data.customerEmail, formattedReturnNumber, data.orderNumber || "N/A")

    revalidatePath("/admin/dashboard")

    return { success: true, returnNumber: formattedReturnNumber }
  } catch (error) {
    console.error("[v0] Error submitting return:", error)
    return { error: "Failed to submit return. Please try again." }
  }
}

export async function trackReturnAction(returnNumber: string) {
  try {
    const supabase = await createClient()

    const { data: returnRecord, error: returnError } = await supabase
      .from("returns")
      .select("*")
      .eq("return_number", returnNumber)
      .single()

    if (returnError || !returnRecord) {
      return { error: "Return not found. Please check your tracking number." }
    }

    const { data: items } = await supabase
      .from("return_items")
      .select("*, product:products(name, sku)")
      .eq("return_id", returnRecord.id)

    const { data: statusHistory } = await supabase
      .from("return_status_history")
      .select("*")
      .eq("return_id", returnRecord.id)
      .order("created_at", { ascending: false })

    const { data: images } = await supabase.from("return_images").select("*").eq("return_id", returnRecord.id)

    return {
      success: true,
      return: {
        ...returnRecord,
        items: items || [],
        statusHistory: statusHistory || [],
        images: images || [],
      },
    }
  } catch (error) {
    console.error("[v0] Error tracking return:", error)
    return { error: "Failed to track return. Please try again." }
  }
}