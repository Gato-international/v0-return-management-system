import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"

/**
 * Validates the API request using one of two methods:
 * 1. Bearer token: Authorization: Bearer <ODOO_API_KEY>
 * 2. Basic auth:   Authorization: Basic <base64(email:password)>
 *    (Uses admin_users table from the portal)
 */
export async function validateApiKey(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  // Method 1: Bearer token (API key)
  if (authHeader.startsWith("Bearer ")) {
    const apiKey = process.env.ODOO_API_KEY
    if (apiKey && authHeader.slice(7) === apiKey) {
      return true
    }
  }

  // Method 2: Basic auth (admin credentials)
  if (authHeader.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8")
      const colonIndex = decoded.indexOf(":")
      if (colonIndex === -1) return false

      const email = decoded.slice(0, colonIndex)
      const password = decoded.slice(colonIndex + 1)

      const supabase = createAdminClient()
      const { data: user, error } = await supabase
        .from("admin_users")
        .select("id, password_hash")
        .eq("email", email)
        .single()

      if (error || !user) return false

      const valid = await bcrypt.compare(password, user.password_hash)
      return valid
    } catch {
      return false
    }
  }

  return false
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
