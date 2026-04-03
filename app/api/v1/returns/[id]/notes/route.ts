import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiKey, unauthorizedResponse, errorResponse, successResponse } from "@/lib/api-auth"

/**
 * GET /api/v1/returns/[id]/notes
 * Get all notes for a return.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("return_notes")
      .select("*")
      .eq("return_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      return errorResponse("Failed to fetch notes")
    }

    return successResponse({ notes: data })
  } catch (error) {
    return errorResponse("Internal server error")
  }
}

/**
 * POST /api/v1/returns/[id]/notes
 * Add an internal note to a return.
 * Body: { note: string }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await validateApiKey(request))) return unauthorizedResponse()

  try {
    const { id } = await params
    const body = await request.json()
    const { note } = body

    if (!note) {
      return errorResponse("Note content is required", 400)
    }

    const supabase = createAdminClient()

    // Verify the return exists
    const { data: returnData } = await supabase
      .from("returns")
      .select("id")
      .eq("id", id)
      .single()

    if (!returnData) {
      return errorResponse("Return not found", 404)
    }

    const { data, error } = await supabase
      .from("return_notes")
      .insert({
        return_id: id,
        note,
        created_by: null, // API-created notes don't have a portal user
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Error creating note:", error)
      return errorResponse("Failed to create note")
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      return_id: id,
      action: "ADD_NOTE_VIA_API",
      details: { note },
    })

    return successResponse({ success: true, note: data }, 201)
  } catch (error) {
    return errorResponse("Internal server error")
  }
}
