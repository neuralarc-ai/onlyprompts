-- Contact Messages Fix for Admin Panel
-- Run this SQL in your Supabase SQL Editor

-- First, check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'contact_messages'
);

-- Create the contact_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_messages;
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON contact_messages;
DROP POLICY IF EXISTS "Allow all contact inserts" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_insert_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_select_policy" ON contact_messages;
DROP POLICY IF EXISTS "contact_update_policy" ON contact_messages;

-- Create new policies

-- 1. Allow anyone to insert contact messages (for contact form submissions)
CREATE POLICY "Allow contact form submissions" ON contact_messages
  FOR INSERT 
  WITH CHECK (true);

-- 2. Allow service role to read all contact messages (for admin API)
CREATE POLICY "Service role can read all contact messages" ON contact_messages
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- 3. Allow service role to update contact messages (for admin API)
CREATE POLICY "Service role can update contact messages" ON contact_messages
  FOR UPDATE 
  USING (auth.role() = 'service_role');

-- 4. Allow authenticated users to read contact messages (for admin interface)
CREATE POLICY "Authenticated users can read contact messages" ON contact_messages
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- 5. Allow authenticated users to update contact messages (for admin interface)
CREATE POLICY "Authenticated users can update contact messages" ON contact_messages
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Insert some sample data for testing
INSERT INTO contact_messages (name, email, subject, message, category, status) VALUES
('John Doe', 'john@example.com', 'General Inquiry', 'I have a question about your service.', 'General Inquiry', 'new'),
('Jane Smith', 'jane@example.com', 'Technical Support', 'I need help with my account.', 'Technical Support', 'new'),
('Bob Johnson', 'bob@example.com', 'Feature Request', 'Can you add a new feature?', 'Feature Request', 'read'),
('Alice Brown', 'alice@example.com', 'Partnership', 'I would like to discuss a partnership.', 'Partnership', 'replied')
ON CONFLICT (id) DO NOTHING;

-- Test the setup
SELECT 
  COUNT(*) as total_messages,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
  COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
  COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages
FROM contact_messages;

-- Show all policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY policyname;
