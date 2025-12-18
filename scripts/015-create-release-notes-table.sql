-- Create release_notes table for user-facing updates and features
CREATE TABLE IF NOT EXISTS release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  release_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_category CHECK (category IN ('feature', 'improvement', 'bugfix', 'announcement'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_release_notes_published ON release_notes(is_published);
CREATE INDEX IF NOT EXISTS idx_release_notes_release_date ON release_notes(release_date DESC);

-- Insert some example release notes
INSERT INTO release_notes (version, title, description, release_date, category, is_published) VALUES
  ('1.0.0', 'Launch of Return Management System', 'We are excited to announce the launch of our new return management system. You can now easily submit return requests, track their status, and manage your returns all in one place.', CURRENT_DATE, 'announcement', true),
  ('1.1.0', 'Enhanced Return Tracking', 'Track your returns in real-time with our improved tracking system. Get instant updates on your return status and receive notifications when your return is processed.', CURRENT_DATE - INTERVAL ''7 days'', 'feature', true),
  ('1.2.0', 'Image Upload Support', 'You can now upload images of your items when submitting a return request. This helps us process your returns faster and more accurately.', CURRENT_DATE - INTERVAL ''14 days'', 'feature', true)
ON CONFLICT DO NOTHING;
