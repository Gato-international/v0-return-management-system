-- This script makes the 'order_number' and 'order_date' columns in the 'returns' table nullable.
-- This is to accommodate return requests where the customer may not have this information readily available.

ALTER TABLE public.returns
ALTER COLUMN order_number DROP NOT NULL;

ALTER TABLE public.returns
ALTER COLUMN order_date DROP NOT NULL;

SELECT 'Script 010 executed: "order_number" and "order_date" columns in "returns" table are now nullable.' AS result;