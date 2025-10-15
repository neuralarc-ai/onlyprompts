-- Setup script to add super admin emails for prompt approval notifications
-- Run this script in your Supabase SQL editor

-- First, ensure the super_admins table exists
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your super admin emails here
-- Replace with actual email addresses of super admins
INSERT INTO super_admins (email) VALUES 
  ('admin@onlyprompts.com'),
  ('superadmin@onlyprompts.com')
ON CONFLICT (email) DO NOTHING;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins(email);

-- Grant necessary permissions
GRANT SELECT ON super_admins TO authenticated;
GRANT SELECT ON super_admins TO anon;

-- Add RLS policy
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read super admin emails (for notifications)
CREATE POLICY "Allow read super admin emails" ON super_admins
  FOR SELECT TO authenticated
  USING (true);

-- Allow only super admins to manage super admin emails
CREATE POLICY "Allow super admins to manage super admin emails" ON super_admins
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Verify the setup
SELECT 'Super admin emails setup complete' as status;
SELECT email, created_at FROM super_admins ORDER BY created_at;
