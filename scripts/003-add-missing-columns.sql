-- Add missing columns to returns table
ALTER TABLE returns 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS preferred_resolution TEXT;

-- Add index for preferred_resolution for filtering
CREATE INDEX IF NOT EXISTS idx_returns_preferred_resolution ON returns(preferred_resolution);
