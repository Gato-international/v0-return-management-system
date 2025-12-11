import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminLoginScreen } from "@/components/auth/admin-login-screen"

export default async function LoginPage() {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    redirect("/admin/dashboard")
  }

  return (
    <AdminLoginScreen />
  )
}