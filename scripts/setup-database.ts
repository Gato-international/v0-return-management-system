import { hash } from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log("[v0] Starting database setup...")

  try {
    // Create tables using raw SQL
    const createTablesSQL = `
      -- Create admin_users table
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create returns table
      CREATE TABLE IF NOT EXISTS returns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        order_number TEXT NOT NULL,
        order_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create return_items table
      CREATE TABLE IF NOT EXISTS return_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        sku TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT NOT NULL,
        condition TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create return_status_history table
      CREATE TABLE IF NOT EXISTS return_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        notes TEXT,
        created_by UUID REFERENCES admin_users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create return_images table
      CREATE TABLE IF NOT EXISTS return_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        filename TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create return_notes table
      CREATE TABLE IF NOT EXISTS return_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
        note TEXT NOT NULL,
        created_by UUID NOT NULL REFERENCES admin_users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create audit_logs table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        details JSONB,
        user_id UUID REFERENCES admin_users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- NEW: Create products table
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        description TEXT,
        price NUMERIC(10, 2),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number);
      CREATE INDEX IF NOT EXISTS idx_returns_customer_email ON returns(customer_email);
      CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
      CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);
      CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
      CREATE INDEX IF NOT EXISTS idx_return_status_history_return_id ON return_status_history(return_id);
      CREATE INDEX IF NOT EXISTS idx_return_images_return_id ON return_images(return_id);
      CREATE INDEX IF NOT EXISTS idx_return_notes_return_id ON return_notes(return_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_return_id ON audit_logs(return_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    `

    console.log("[v0] Creating tables...")
    const { error: tablesError } = await supabase.rpc("exec_sql", { sql: createTablesSQL })

    if (tablesError) {
      console.error("[v0] Error creating tables:", tablesError)
      throw tablesError
    }

    console.log("[v0] Tables created successfully!")

    // Generate password hash for admin user
    console.log("[v0] Generating admin password hash...")
    const passwordHash = await hash("Admin123!", 10)

    // Insert admin user
    console.log("[v0] Creating admin user...")
    const { error: adminError } = await supabase.from("admin_users").upsert(
      {
        email: "admin@company.com",
        password_hash: passwordHash,
        name: "Admin User",
      },
      {
        onConflict: "email",
      },
    )

    if (adminError) {
      console.error("[v0] Error creating admin user:", adminError)
      throw adminError
    }

    console.log("[v0] Admin user created successfully!")
    console.log("[v0] Database setup complete!")
    console.log("[v0] Admin credentials:")
    console.log("[v0]   Email: admin@company.com")
    console.log("[v0]   Password: Admin123!")
  } catch (error) {
    console.error("[v0] Database setup failed:", error)
    throw error
  }
}

setupDatabase()