-- This script makes the 'reason' column on the main returns table optional.
-- This is necessary because the return reason is now handled on a per-item basis.
-- Please run this command in your Supabase project's SQL Editor.

ALTER TABLE returns ALTER COLUMN reason DROP NOT NULL;