-- =====================================================================================
-- FINAL ATTEMPT: Create 'products' table and force schema cache reload
-- This script is the definitive solution to the "Could not find the table 'public.products'" error.
-- It is safe to run this script multiple times.
-- =====================================================================================

-- Step 1: Ensure the 'products' table exists with the correct structure.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Ensure the table is owned by the correct role (usually 'postgres').
-- This is a safety check and might not be necessary but is good practice.
ALTER TABLE public.products OWNER TO postgres;

-- Step 3: Grant all permissions on this table to the necessary roles.
-- The 'service_role' (used by the app's admin client) needs full access.
GRANT ALL ON TABLE public.products TO postgres;
GRANT ALL ON TABLE public.products TO service_role;

-- Step 4: Create an index on the SKU for faster lookups, if it doesn't exist.
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Step 5: Link 'return_items' to 'products'
-- This ensures that when a product is referenced in a return, the link is valid.
DO $$
BEGIN
    -- Add the 'product_id' column to 'return_items' if it's missing.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'return_items' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE public.return_items ADD COLUMN product_id UUID;
    END IF;

    -- Add the foreign key constraint. This is dropped and re-added to ensure it's correct.
    ALTER TABLE public.return_items DROP CONSTRAINT IF EXISTS return_items_product_id_fkey;
    ALTER TABLE public.return_items
    ADD CONSTRAINT return_items_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE SET NULL;
END $$;

-- =====================================================================================
-- Step 6: CRITICAL - Force Supabase's API to reload its schema cache.
-- This tells the API layer to recognize the newly created 'products' table immediately.
-- This is the most important step to solve the persistent error.
-- =====================================================================================
NOTIFY pgrst, 'reload schema';

-- Final confirmation message
SELECT 'Script 008-final-product-table-setup.sql executed. The products table should now be available to the API.' AS result;