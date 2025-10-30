"use server"

import { verifyCredentials, createSession, setSessionCookie, clearSessionCookie } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const user = await verifyCredentials(email, password)

  if (!user) {
    return { error: "Invalid email or password" }
  }

  // Create session token
  const token = await createSession(user)
  await setSessionCookie(token)

  // Log the login
  const supabase = createAdminClient()
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "LOGIN",
    details: { message: "User logged in successfully" },
  })

  redirect("/admin/dashboard")
}

export async function logoutAction() {
  await clearSessionCookie()
  redirect("/admin/login")
}