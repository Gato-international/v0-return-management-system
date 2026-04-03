import { NextRequest, NextResponse } from "next/server"

/**
 * Validates the API key from the Authorization header.
 * Expects: Authorization: Bearer <ODOO_API_KEY>
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = process.env.ODOO_API_KEY
  if (!apiKey) {
    console.error("[API] ODOO_API_KEY environment variable is not set")
    return false
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return false

  return authHeader.slice(7) === apiKey
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
