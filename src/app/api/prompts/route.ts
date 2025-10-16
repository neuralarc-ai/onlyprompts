import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { EmailService } from '@/lib/emailService'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const trending = searchParams.get('trending')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let prompts

    if (trending === 'true') {
      prompts = await DatabaseService.getTrendingPrompts(limit, offset)
    } else if (search) {
      prompts = await DatabaseService.searchPrompts(search, limit, offset)
    } else {
      prompts = await DatabaseService.getPrompts(limit, offset)
    }

    return NextResponse.json(prompts)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

    console.log('API POST request received');
    console.log('Auth header present:', !!authHeader);
    console.log('Token present:', !!token);
    console.log('Request body keys:', Object.keys(body));

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
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })

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
    
    // Validate required fields
    if (!body.title || !body.prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('prompts')
      .insert([
        {
          title: body.title,
          prompt: body.prompt,
          image_url: body.imageUrl || body.image_url,
          author: body.author,
          tags: Array.isArray(body.tags)
            ? body.tags
            : body.tags
            ? String(body.tags)
                .split(',')
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0)
            : [],
          user_id: authedUser.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
    }

    // Send email notification to super admins
    try {
      const superAdminEmails = await DatabaseService.getSuperAdminEmails()
      
      if (superAdminEmails.length > 0) {
        await EmailService.sendPromptApprovalNotification(
          {
            id: data.id,
            title: data.title,
            author: data.author,
            prompt: data.prompt
          },
          superAdminEmails
        )
        console.log('📧 Email notification sent to super admins')
      } else {
        console.log('⚠️ No super admin emails found for notification')
      }
    } catch (emailError) {
      // Don't fail the prompt creation if email fails
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
