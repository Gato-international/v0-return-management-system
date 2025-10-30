import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client for server-side operations using the service role key.
 * This client bypasses all Row Level Security (RLS) policies and should be used with caution.
 * It is intended for admin-only server actions where elevated privileges are required.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not defined.")
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}