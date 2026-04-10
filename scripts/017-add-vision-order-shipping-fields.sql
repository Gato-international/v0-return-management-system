-- Migration 017: Add Vision validation, order verification, and shipping date fields
-- Required for: Google Vision image validation, order verification, and shipping date features

-- Add shipping_date: when customer plans to ship the return package
ALTER TABLE returns ADD COLUMN IF NOT EXISTS shipping_date DATE;

-- Add vision_validated: whether all images passed Google Vision validation
ALTER TABLE returns ADD COLUMN IF NOT EXISTS vision_validated BOOLEAN DEFAULT false;

-- Add order_verified: whether the return items were verified against an actual order
ALTER TABLE returns ADD COLUMN IF NOT EXISTS order_verified BOOLEAN DEFAULT false;

-- Add order_verification_result: full JSON result from order verification
ALTER TABLE returns ADD COLUMN IF NOT EXISTS order_verification_result JSONB;

-- Add vision_validation_results: per-image Vision API validation results
ALTER TABLE returns ADD COLUMN IF NOT EXISTS vision_validation_results JSONB;

-- Add preferred_resolution to returns (may not exist in older schemas)
ALTER TABLE returns ADD COLUMN IF NOT EXISTS preferred_resolution TEXT;

-- Add description to returns (may not exist in older schemas)
ALTER TABLE returns ADD COLUMN IF NOT EXISTS description TEXT;

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_returns_shipping_date ON returns(shipping_date);
CREATE INDEX IF NOT EXISTS idx_returns_order_verified ON returns(order_verified);
CREATE INDEX IF NOT EXISTS idx_returns_vision_validated ON returns(vision_validated);
