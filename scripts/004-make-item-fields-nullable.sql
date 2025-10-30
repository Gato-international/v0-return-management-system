-- Make reason and condition nullable in return_items table
-- since these are optional at the item level (return-level reason is sufficient)
ALTER TABLE return_items 
  ALTER COLUMN reason DROP NOT NULL,
  ALTER COLUMN condition DROP NOT NULL;
