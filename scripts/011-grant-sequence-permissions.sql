-- Grant permissions for sequence usage to allow public form submissions.
-- This is necessary for the public return form to be able to generate a return number.
-- Please run this command in your Supabase project's SQL Editor.

GRANT USAGE, SELECT ON SEQUENCE returns_return_number_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE returns_return_number_seq TO authenticated;