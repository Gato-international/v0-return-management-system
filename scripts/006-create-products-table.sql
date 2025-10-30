-- This script creates the 'products' table and ensures the 'return_items' table is correctly linked.
-- It is safe to run this script multiple times.

-- 1. Create the 'products' table if it doesn't exist.
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add an index on the SKU for faster lookups.
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 3. Add the 'product_id' column to 'return_items' if it doesn't already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'return_items' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE return_items ADD COLUMN product_id UUID;
  END IF;
END $$;

-- 4. Add the foreign key constraint from 'return_items' to 'products'.
-- We first drop the constraint if it exists, then add it back to ensure it's correct.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'return_items_product_id_fkey' AND table_name = 'return_items'
  ) THEN
    ALTER TABLE return_items DROP CONSTRAINT return_items_product_id_fkey;
  END IF;
END $$;

ALTER TABLE return_items
ADD CONSTRAINT return_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE SET NULL;

-- Log completion
SELECT 'Script 006-create-products-table.sql executed successfully.' AS result;