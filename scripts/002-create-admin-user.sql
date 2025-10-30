-- Insert default admin user
-- Password: Admin123!
-- Note: Run scripts/generate-admin-hash.ts to generate a new hash if needed
INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'admin@company.com',
  '$2a$10$YourActualBcryptHashHere',
  'Admin User'
)
ON CONFLICT (email) DO NOTHING;
