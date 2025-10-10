import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, category } = body;

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert contact message into database
    // First try with the regular client
    let { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        category: category.trim(),
        status: 'new'
      })
      .select()
      .single();

    // If that fails due to RLS, try with service role key
    if (error && error.code === '42501') {
      console.log('RLS error detected, trying with service role...');
      
      // Create a new client with service role key
      const { createClient } = require('@supabase/supabase-js');
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (serviceRoleKey) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey
        );
        
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('contact_messages')
          .insert({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            category: category.trim(),
            status: 'new'
          })
          .select()
          .single();
        
        if (!adminError) {
          data = adminData;
          error = null;
          console.log('Successfully inserted with service role');
        } else {
          console.error('Service role insert also failed:', adminError);
        }
      } else {
        console.error('Service role key not found in environment variables');
      }
    }

    if (error) {
      console.error('Error inserting contact message:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { 
          error: 'Failed to save contact message',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('Contact message saved successfully:', data);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact message sent successfully',
        id: data.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint is for admin use - you might want to add authentication
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contact messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contact messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: data });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
