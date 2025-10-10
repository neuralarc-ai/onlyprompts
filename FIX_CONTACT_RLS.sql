-- Fix Contact Messages RLS Issues
-- Run this in your Supabase SQL Editor

-- First, let's check if the table exists and what policies are currently set
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contact_messages';

-- Drop all existing policies on contact_messages
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_messages;
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON contact_messages;
DROP POLICY IF EXISTS "Allow all contact inserts" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;

-- Temporarily disable RLS to ensure we can insert
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Test insert to make sure the table works
INSERT INTO contact_messages (name, email, subject, message, category, status) 
VALUES ('Test User', 'test@example.com', 'Test Subject', 'Test message', 'General Inquiry', 'new');

-- Delete the test record
DELETE FROM contact_messages WHERE email = 'test@example.com';

-- Re-enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create a simple, permissive policy for inserts
CREATE POLICY "contact_insert_policy" ON contact_messages
  FOR INSERT 
  WITH CHECK (true);

-- Create policies for authenticated users (admin interface)
CREATE POLICY "contact_select_policy" ON contact_messages
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "contact_update_policy" ON contact_messages
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Test the policy by trying to insert as anonymous user
-- This should work now
INSERT INTO contact_messages (name, email, subject, message, category, status) 
VALUES ('Anonymous Test', 'anonymous@test.com', 'Anonymous Test', 'This should work', 'General Inquiry', 'new');

-- Clean up test data
DELETE FROM contact_messages WHERE email IN ('test@example.com', 'anonymous@test.com');

-- Show final policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'contact_messages';
