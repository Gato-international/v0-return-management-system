import { hash } from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Missing required environment variables:")
  console.error("[v0] SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.error("[v0] SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✓" : "✗")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function resetAdminUser() {
  console.log("[v0] Resetting admin user...")

  try {
    // Generate password hash
    console.log("[v0] Generating password hash for: Admin123!")
    const passwordHash = await hash("Admin123!", 10)
    console.log("[v0] Password hash generated:", passwordHash.substring(0, 20) + "...")

    // Delete existing admin user if exists
    console.log("[v0] Deleting existing admin user...")
    await supabase.from("admin_users").delete().eq("email", "admin@company.com")

    // Insert new admin user
    console.log("[v0] Creating new admin user...")
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email: "admin@company.com",
        password_hash: passwordHash,
        name: "Admin User",
      })
      .select()

    if (error) {
      console.error("[v0] Error creating admin user:", error)
      throw error
    }

    console.log("[v0] Admin user created successfully!")
    console.log("[v0] User data:", data)
    console.log("[v0]")
    console.log("[v0] ===================================")
    console.log("[v0] Admin Login Credentials:")
    console.log("[v0] ===================================")
    console.log("[v0] Email: admin@company.com")
    console.log("[v0] Password: Admin123!")
    console.log("[v0] Login URL: /admin/login")
    console.log("[v0] ===================================")
  } catch (error) {
    console.error("[v0] Failed to reset admin user:", error)
    throw error
  }
}

resetAdminUser()
