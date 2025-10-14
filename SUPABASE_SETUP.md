# Supabase Integration Setup Guide

This guide will help you set up Supabase for real-time data storage in your NanoB application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: nanob
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **anon public key**
   - **service_role secret key** (keep this secure!)

## 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up Database Schema

Run these SQL commands in your Supabase SQL Editor:

### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create prompts table
CREATE TABLE prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  likes INTEGER DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create likes table
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

-- Create users profile table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_likes ON prompts(likes DESC);
CREATE INDEX idx_likes_prompt_id ON likes(prompt_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

### Create Functions

```sql
-- Function to increment likes
CREATE OR REPLACE FUNCTION increment_likes(prompt_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE prompts SET likes = likes + 1 WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes
CREATE OR REPLACE FUNCTION decrement_likes(prompt_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE prompts SET likes = GREATEST(likes - 1, 0) WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Set Up Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for prompts
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for likes
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 5. Insert Sample Data

```sql
-- Insert sample prompts
INSERT INTO prompts (title, description, prompt, image_url, author, category, tags) VALUES
('Cyberpunk Cityscape', 'A stunning futuristic city with neon lights and flying cars', 'A cyberpunk cityscape at night, neon lights reflecting on wet streets, flying cars in the sky, tall buildings with holographic advertisements, dark atmosphere with bright colorful accents, highly detailed, 4K resolution', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop', 'Alex Chen', 'Art & Design', ARRAY['cyberpunk', 'cityscape', 'futuristic']),
('Professional LinkedIn Post', 'Generate engaging professional content for LinkedIn', 'Write a professional LinkedIn post about [topic] that includes: a compelling hook in the first line, 3-4 key points with actionable insights, relevant industry statistics, a call-to-action, and professional but engaging tone. Keep it under 1500 characters.', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop', 'Sarah Johnson', 'Marketing', ARRAY['linkedin', 'professional', 'content']),
('Fantasy Dragon Portrait', 'Majestic dragon with intricate details and magical aura', 'A majestic fantasy dragon portrait, ancient and wise looking, intricate scales with metallic reflections, glowing eyes, magical aura surrounding it, detailed facial features, fantasy art style, high contrast lighting, 8K resolution', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop', 'Mike Rodriguez', 'Art & Design', ARRAY['fantasy', 'dragon', 'portrait']);
```

## 6. Enable Real-time

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `prompts` table
   - `likes` table
   - `user_profiles` table

## 7. Test Your Setup

1. Start your development server: `npm run dev`
2. Open your browser to `http://localhost:3000`
3. You should see your sample prompts loading from Supabase
4. Try liking prompts (you'll need authentication for this)
5. Check the Supabase dashboard to see real-time updates

## 8. Next Steps

- Set up authentication (Supabase Auth)
- Add user registration/login
- Implement prompt submission
- Add user profiles
- Set up file uploads for images

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables
2. **"Row Level Security" errors**: Make sure RLS policies are set up correctly
3. **Real-time not working**: Ensure replication is enabled for your tables
4. **CORS errors**: Check your Supabase project settings

### Useful Commands:

```bash
# Check if Supabase is properly configured
npm run dev

# View logs
tail -f .next/cache/turbopack.log
```

## Security Notes

- Never commit your `.env.local` file
- Use RLS policies to secure your data
- Regularly rotate your service role key
- Monitor your API usage in the Supabase dashboard

For more help, check the [Supabase Documentation](https://supabase.com/docs).








