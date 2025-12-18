-- Create developer_todos table for task tracking
CREATE TABLE IF NOT EXISTS developer_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_developer_todos_done ON developer_todos(done);
CREATE INDEX IF NOT EXISTS idx_developer_todos_created_at ON developer_todos(created_at);

-- Insert some default todos
INSERT INTO developer_todos (text, done) VALUES
  ('Review Calendar PR (React/TS)', false),
  ('Implement authentication in the email provider', true),
  ('Refactor components in the Tauri/React 19 app', false),
  ('Test image downloads in Novon', false),
  ('Organize CSS and layouts', true),
  ('Draft the apps roadmap', false)
ON CONFLICT DO NOTHING;
