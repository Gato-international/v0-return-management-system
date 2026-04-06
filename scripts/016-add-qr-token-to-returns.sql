-- Add qr_token column to returns table for QR code based return slip lookups
-- Each return gets a unique UUID token that is encoded in the QR code on the return slip PDF.
-- This token is NOT the sequential return_number — it's unguessable.

-- 1. Add the qr_token column
ALTER TABLE returns
ADD COLUMN IF NOT EXISTS qr_token UUID DEFAULT gen_random_uuid();

-- 2. Backfill existing returns that might have NULL qr_token
UPDATE returns
SET qr_token = gen_random_uuid()
WHERE qr_token IS NULL;

-- 3. Make it NOT NULL after backfill
ALTER TABLE returns
ALTER COLUMN qr_token SET NOT NULL;

-- 4. Add unique constraint
ALTER TABLE returns
ADD CONSTRAINT returns_qr_token_unique UNIQUE (qr_token);

-- 5. Add index for fast lookups by qr_token (used when scanning QR codes)
CREATE INDEX IF NOT EXISTS idx_returns_qr_token ON returns(qr_token);

SELECT 'Script 016-add-qr-token-to-returns.sql executed successfully.' AS result;
