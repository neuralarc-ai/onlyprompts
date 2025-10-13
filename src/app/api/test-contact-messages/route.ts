import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Test 1: Check if table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('contact_messages')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Table does not exist or not accessible',
        details: tableError.message
      });
    }

    // Test 2: Fetch all messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (messagesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch messages',
        details: messagesError.message
      });
    }

    // Test 3: Insert a test message
    const testMessage = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Message',
      message: 'This is a test message to verify the contact system is working.',
      category: 'General Inquiry',
      status: 'new' as const
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert(testMessage)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert test message',
        details: insertError.message,
        tableExists: true,
        messageCount: messages?.length || 0,
        messages: messages || []
      });
    }

    // Clean up test message
    await supabaseAdmin
      .from('contact_messages')
      .delete()
      .eq('id', insertData.id);

    return NextResponse.json({
      success: true,
      message: 'Contact messages system is working correctly',
      tableExists: true,
      messageCount: messages?.length || 0,
      messages: messages || [],
      testInsert: 'Success'
    });

  } catch (error) {
    console.error('Test contact messages error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
