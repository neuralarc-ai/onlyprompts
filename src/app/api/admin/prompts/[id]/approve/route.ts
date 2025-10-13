import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    // Verify the token using the service role client
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

    // Check if user is SuperAdmin
    const isSuperAdmin = await DatabaseService.isSuperAdmin(authedUser.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. SuperAdmin role required.' }, { status: 403 })
    }

    // Approve the prompt
    await DatabaseService.approvePrompt(id, authedUser.id)

    return NextResponse.json({ message: 'Prompt approved successfully' })
  } catch (error) {
    console.error('Error approving prompt:', error)
    return NextResponse.json(
      { error: 'Failed to approve prompt' },
      { status: 500 }
    )
  }
}
