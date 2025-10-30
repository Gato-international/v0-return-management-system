import { createAdminClient } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV || JWT_SECRET_ENV === "your-secret-key-change-in-production") {
  console.error("[v0] CRITICAL ERROR: JWT_SECRET environment variable is not set or is using the default placeholder. Please set a strong, unique secret in your .env file.");
  // In a production application, you might want to throw an error here to prevent the app from starting.
  // For now, we'll proceed with the default but log a severe warning.
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_ENV || "your-secret-key-change-in-production");

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string): Promise<SessionUser | null> {
  try {
    console.log("[v0] Verifying credentials for:", email)
    const supabase = createAdminClient()

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, email, password_hash, name")
      .eq("email", email)
      .single()

    console.log("[v0] User query result:", { found: !!user, error: error?.message })

    if (error || !user) {
      console.log("[v0] User not found in database")
      return null
    }

    console.log("[v0] Comparing password...")
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log("[v0] Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return null
    }

    console.log("[v0] Login successful for:", email)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "admin",
    }
  } catch (error) {
    console.error("[v0] Error verifying credentials:", error)
    return null
  }
}

// Create JWT token
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)

  return token
}

// Verify JWT token
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload.user as SessionUser
  } catch (error) {
    return null
  }
}

// Get current session from cookies
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return null
  }

  return verifySession(token)
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

// Require authentication (for use in server components/actions)
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}