-- SuperAdmin Setup for NanoB
-- This script sets up the SuperAdmin role and approval system for prompts

-- 1. Create user_roles table to manage user roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Add approval status to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_approval_status ON prompts(approval_status);
CREATE INDEX IF NOT EXISTS idx_prompts_reviewed_by ON prompts(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 4. Create function to check if user is SuperAdmin
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = is_superadmin.user_id 
    AND user_roles.role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to assign SuperAdmin role
CREATE OR REPLACE FUNCTION assign_superadmin_role(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user role to superadmin
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'superadmin')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'superadmin',
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to approve a prompt
CREATE OR REPLACE FUNCTION approve_prompt(
  prompt_id UUID,
  reviewer_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Check if reviewer is superadmin
  IF NOT is_superadmin(reviewer_id) THEN
    RAISE EXCEPTION 'Only SuperAdmins can approve prompts';
  END IF;

  -- Update prompt status
  UPDATE prompts 
  SET 
    approval_status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    rejection_reason = NULL
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to reject a prompt
CREATE OR REPLACE FUNCTION reject_prompt(
  prompt_id UUID,
  reviewer_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Check if reviewer is superadmin
  IF NOT is_superadmin(reviewer_id) THEN
    RAISE EXCEPTION 'Only SuperAdmins can reject prompts';
  END IF;

  -- Update prompt status
  UPDATE prompts 
  SET 
    approval_status = 'rejected',
    reviewed_by = reviewer_id,
    reviewed_at = NOW(),
    rejection_reason = reason
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create RLS policies for user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update roles
CREATE POLICY "Service role can manage roles" ON user_roles
  FOR ALL USING (auth.role() = 'service_role');

-- 9. Update prompts RLS policies to only show approved prompts to regular users
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Prompts are viewable by everyone" ON prompts;
DROP POLICY IF EXISTS "Users can insert their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;

-- Create new policies
CREATE POLICY "Approved prompts are viewable by everyone" ON prompts
  FOR SELECT USING (approval_status = 'approved');

-- SuperAdmins can see all prompts
CREATE POLICY "SuperAdmins can view all prompts" ON prompts
  FOR SELECT USING (is_superadmin(auth.uid()));

-- Users can insert prompts (they will be pending by default)
CREATE POLICY "Users can insert prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending prompts
CREATE POLICY "Users can update own pending prompts" ON prompts
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND approval_status = 'pending'
  );

-- Users can delete their own pending prompts
CREATE POLICY "Users can delete own pending prompts" ON prompts
  FOR DELETE USING (
    auth.uid() = user_id 
    AND approval_status = 'pending'
  );

-- SuperAdmins can update any prompt
CREATE POLICY "SuperAdmins can update any prompt" ON prompts
  FOR UPDATE USING (is_superadmin(auth.uid()));

-- SuperAdmins can delete any prompt
CREATE POLICY "SuperAdmins can delete any prompt" ON prompts
  FOR DELETE USING (is_superadmin(auth.uid()));

-- 10. Create a view for SuperAdmin dashboard
CREATE OR REPLACE VIEW pending_prompts AS
SELECT 
  p.*,
  u.email as author_email,
  u.created_at as author_created_at
FROM prompts p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.approval_status = 'pending'
ORDER BY p.created_at ASC;

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON pending_prompts TO authenticated;
GRANT EXECUTE ON FUNCTION is_superadmin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_prompt(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_prompt(UUID, UUID, TEXT) TO authenticated;

-- 12. Create a function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_roles 
    WHERE user_roles.user_id = get_user_role.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
