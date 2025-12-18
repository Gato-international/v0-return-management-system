-- Create notification_banner table for site-wide notifications
CREATE TABLE IF NOT EXISTS notification_banner (
  id INTEGER PRIMARY KEY DEFAULT 1,
  message TEXT NOT NULL,
  color_scheme TEXT NOT NULL DEFAULT 'info',
  display_type TEXT NOT NULL DEFAULT 'banner',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_only_one_row CHECK (id = 1),
  CONSTRAINT check_color_scheme CHECK (color_scheme IN ('info', 'success', 'warning', 'danger')),
  CONSTRAINT check_display_type CHECK (display_type IN ('banner', 'popup'))
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notification_banner_is_active ON notification_banner(is_active);

-- Insert default row if not exists
INSERT INTO notification_banner (id, message, color_scheme, display_type, is_active)
VALUES (1, 'Welcome to our return portal!', 'info', 'banner', false)
ON CONFLICT (id) DO NOTHING;
