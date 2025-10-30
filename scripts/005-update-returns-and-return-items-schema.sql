-- Rename customer_name to company_name in returns table
ALTER TABLE returns
RENAME COLUMN customer_name TO company_name;

-- Remove order_number from returns table
ALTER TABLE returns
DROP COLUMN order_number;

-- Remove order_date from returns table
ALTER TABLE returns
DROP COLUMN order_date;

-- Add product_id to return_items table
ALTER TABLE return_items
ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;