-- This script makes the 'reason' column in the 'returns' table nullable.
-- This is necessary because the reason for a return is now stored per-item
-- in the 'return_items' table, not on the overall return record.
-- Running this will fix the "violates not-null constraint" error on return submission.

ALTER TABLE public.returns
ALTER COLUMN reason DROP NOT NULL;

SELECT 'Script 009 executed: The "reason" column in the "returns" table is now nullable.' AS result;