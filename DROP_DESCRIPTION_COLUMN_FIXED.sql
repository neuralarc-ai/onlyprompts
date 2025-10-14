    -- Drop description column from prompts table
    -- This script handles the dependency on the pending_prompts view

    -- First, let's check what views depend on the description column
    -- (This is just for reference)
    SELECT 
        schemaname,
        viewname,
        definition
    FROM pg_views 
    WHERE definition LIKE '%description%' 
    AND schemaname = 'public';

    -- Drop the dependent view first
    DROP VIEW IF EXISTS pending_prompts CASCADE;

    -- Now drop the description column
    ALTER TABLE prompts DROP COLUMN IF EXISTS description;

    -- Recreate the pending_prompts view without the description column
    -- (Assuming this view was used for admin purposes)
    CREATE VIEW pending_prompts AS
    SELECT 
        id,
        title,
        prompt,  -- Using prompt instead of description
        image_url,
        author,
        category,
        tags,
        likes,
        created_at,
        updated_at,
        user_id,
        approval_status,
        reviewed_by,
        reviewed_at,
        rejection_reason
    FROM prompts
    WHERE approval_status = 'pending'
    ORDER BY created_at DESC;

    -- Grant appropriate permissions to the view
    GRANT SELECT ON pending_prompts TO authenticated;
    GRANT SELECT ON pending_prompts TO anon;

    -- Verify the column has been removed
    -- You can run this query to confirm: SELECT * FROM prompts LIMIT 1;
