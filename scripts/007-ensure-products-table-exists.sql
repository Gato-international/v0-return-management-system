-- This script provides a definitive fix for the missing 'products' table.
-- It is safe to run multiple times.

-- Enable the pgcrypto extension if not already enabled, for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the 'products' table with all required columns and constraints.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add a comment to the table for clarity.
COMMENT ON TABLE public.products IS 'Stores product information for return management.';

-- Create an index on the SKU column for efficient searching.
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Ensure the 'return_items' table has a column to reference the 'products' table.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'return_items' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE public.return_items ADD COLUMN product_id UUID;
    END IF;
END $$;

-- Add a foreign key constraint to link 'return_items' to 'products'.
-- This ensures data integrity.
ALTER TABLE public.return_items
DROP CONSTRAINT IF EXISTS return_items_product_id_fkey,
ADD CONSTRAINT return_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES public.products(id)
    ON DELETE SET NULL;

-- Log completion message
SELECT 'Script 007-ensure-products-table-exists.sql executed successfully. The products table is ready.' AS status;