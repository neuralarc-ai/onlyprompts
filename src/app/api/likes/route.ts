import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

// Create admin client dynamically to ensure environment variables are loaded
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('Environment variables check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceRoleKey,
    supabaseUrl: supabaseUrl ? 'present' : 'missing',
    serviceRoleKey: serviceRoleKey ? 'present' : 'missing'
  })
  
  if (!supabaseUrl || !serviceRoleKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`)
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promptId, userId, action } = body
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null

    console.log('Likes API - Request received:', { promptId, userId, action, hasToken: !!token })

    if (!token) {
      console.error('No authorization token provided')
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    // Verify the token using the service role client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Use service role client to verify the user token
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin()
    } catch (envError) {
      console.error('Environment variable error:', envError)
      return NextResponse.json({ error: 'Server configuration error: ' + (envError as Error).message }, { status: 500 })
    }

    // Verify the JWT token
    const { data: { user: authedUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError) {
      console.error('Token verification error:', authError)
      return NextResponse.json({ error: 'Invalid token: ' + authError.message }, { status: 401 })
    }

    if (!authedUser) {
      console.error('No user found for token')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Ensure the userId matches the authenticated user
    if (authedUser.id !== userId) {
      console.error('User ID mismatch:', { authedUserId: authedUser.id, requestUserId: userId })
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 })
    }

    if (!promptId || !userId) {
      return NextResponse.json(
        { error: 'Missing promptId or userId' },
        { status: 400 }
      )
    }

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json(
        { error: 'Invalid action. Use "like" or "unlike"' },
        { status: 400 }
      )
    }

    if (action === 'like') {
      // Insert like (id is UUID by default in schema); ignore duplicates
      console.log('Inserting like:', { promptId, userId })
      const { data: insertData, error: insertError } = await (supabaseAdmin as any)
        .from('likes')
        .insert({ prompt_id: promptId, user_id: userId })
        .select()
      
      if (insertError && insertError.code !== '23505') {
        console.error('Insert like error:', insertError)
        return NextResponse.json({ error: 'Failed to like prompt: ' + insertError.message }, { status: 500 })
      }
      console.log('Like inserted successfully:', insertData)
    } else {
      // Remove like
      console.log('Removing like:', { promptId, userId })
      const { data: deleteData, error: deleteError } = await (supabaseAdmin as any)
        .from('likes')
        .delete()
        .eq('prompt_id', promptId)
        .eq('user_id', userId)
        .select()
      if (deleteError) {
        console.error('Delete like error:', deleteError)
        return NextResponse.json({ error: 'Failed to unlike prompt: ' + deleteError.message }, { status: 500 })
      }
      console.log('Like removed successfully:', deleteData)
    }

    // Recalculate like count for the prompt and persist on parent row
    console.log('Recalculating like count for prompt:', promptId)
    
    try {
      const { count: likeCount, error: countError } = await (supabaseAdmin as any)
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('prompt_id', promptId)

      if (countError) {
        console.error('Count likes error:', countError)
        return NextResponse.json({ error: 'Failed to count likes: ' + countError.message }, { status: 500 })
      }

      console.log('Like count calculated:', likeCount)

      // Update the prompt's like count
      const { error: updateError } = await (supabaseAdmin as any)
        .from('prompts')
        .update({ likes: likeCount || 0 })
        .eq('id', promptId)
      
      if (updateError) {
        console.error('Update prompt.like count error:', updateError)
        return NextResponse.json({ error: 'Failed to update like count: ' + updateError.message }, { status: 500 })
      }

      console.log('Prompt like count updated successfully:', { promptId, likeCount })

      return NextResponse.json({ success: true, likes: likeCount || 0 })
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      return NextResponse.json({ error: 'Database operation failed: ' + (dbError as Error).message }, { status: 500 })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Likes API - GET request received');
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const promptId = searchParams.get('promptId')

    console.log('Likes API - GET params:', { userId, promptId });

    if (!userId) {
      console.log('Likes API - Missing userId, returning 400');
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // For testing purposes, if userId is 'test', return empty likes
    if (userId === 'test') {
      console.log('Likes API - Test userId, returning empty likes');
      return NextResponse.json({ likes: [] })
    }
    
    // Check environment variables
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Likes API - Environment check:', { 
      hasServiceRoleKey: !!serviceRoleKey 
    });

    // Create admin client for database operations
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin()
    } catch (envError) {
      console.error('Environment variable error:', envError)
      return NextResponse.json({ error: 'Server configuration error: ' + (envError as Error).message }, { status: 500 })
    }

    if (promptId) {
      // Check if specific prompt is liked
      console.log('Likes API - Checking if specific prompt is liked:', { promptId, userId });
      const { data, error } = await (supabaseAdmin as any)
        .from('likes')
        .select('id')
        .eq('prompt_id', promptId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Likes API - Error checking if liked:', error)
        return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 })
      }
      
      console.log('Likes API - Specific prompt like check result:', { data, isLiked: !!data });
      return NextResponse.json({ isLiked: !!data })
    } else {
      // Get all user likes
      console.log('Likes API - Fetching all user likes:', { userId });
      const { data, error } = await (supabaseAdmin as any)
        .from('likes')
        .select('prompt_id')
        .eq('user_id', userId)

      if (error) {
        console.error('Likes API - Error fetching user likes:', error)
        return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 })
      }

      const likes = data.map((like: any) => like.prompt_id)
      console.log('Likes API - User likes result:', { likes });
      return NextResponse.json({ likes })
    }
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    )
  }
}

