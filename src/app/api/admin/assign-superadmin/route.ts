import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Verify the request is from a SuperAdmin or service role
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })

    // Verify the JWT token
    const { data: { user: authedUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authedUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Find the user by email using the admin API
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const targetUser = users.find(user => user.email === userEmail)
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Assign SuperAdmin role using the database function
    const { error: assignError } = await supabaseAdmin
      .rpc('assign_superadmin_role', { target_user_id: targetUser.id })

    if (assignError) {
      console.error('Error assigning SuperAdmin role:', assignError)
      return NextResponse.json({ error: 'Failed to assign SuperAdmin role' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'SuperAdmin role assigned successfully',
      userId: targetUser.id 
    })
  } catch (error) {
    console.error('Error assigning SuperAdmin role:', error)
    return NextResponse.json(
      { error: 'Failed to assign SuperAdmin role' },
      { status: 500 }
    )
  }
}
