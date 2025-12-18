-- Add display_type column to existing notification_banner table
ALTER TABLE notification_banner 
ADD COLUMN IF NOT EXISTS display_type TEXT NOT NULL DEFAULT 'banner';

-- Add image_url column for popup images
ALTER TABLE notification_banner 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Drop old constraint if exists and add new one with white color
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_color_scheme'
  ) THEN
    ALTER TABLE notification_banner DROP CONSTRAINT check_color_scheme;
  END IF;
END $$;

ALTER TABLE notification_banner 
ADD CONSTRAINT check_color_scheme CHECK (color_scheme IN ('info', 'success', 'warning', 'danger', 'white'));

-- Add constraint for display_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_display_type'
  ) THEN
    ALTER TABLE notification_banner 
    ADD CONSTRAINT check_display_type CHECK (display_type IN ('banner', 'popup'));
  END IF;
END $$;
