-- Contact Messages Table Setup
-- Run this SQL in your Supabase SQL Editor

-- Create contact_messages table
CREATE TABLE contact_messages (
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

-- Create index for better query performance
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert contact messages (for the contact form)
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read all contact messages (for admin)
CREATE POLICY "Authenticated users can read contact messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update contact messages (for admin)
CREATE POLICY "Authenticated users can update contact messages" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Insert some sample data (optional)
INSERT INTO contact_messages (name, email, subject, message, category, status) VALUES
('John Doe', 'john@example.com', 'Question about pricing', 'Hi, I would like to know more about your pricing plans. Can you provide more details?', 'General Inquiry', 'new'),
('Jane Smith', 'jane@example.com', 'Technical issue', 'I am having trouble uploading my avatar. The image keeps failing to upload.', 'Technical Support', 'read'),
('Mike Johnson', 'mike@example.com', 'Feature request', 'It would be great to have a dark mode toggle for the interface.', 'Feature Request', 'new');
