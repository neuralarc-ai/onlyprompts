import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing contact_messages table...');
    
    // Test 1: Check if table exists by trying to select
    const { data: selectData, error: selectError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('Select error:', selectError);
      return NextResponse.json({
        success: false,
        error: 'Table access error',
        details: selectError.message,
        code: selectError.code
      }, { status: 500 });
    }

    // Test 2: Try to insert a test record
    const testData = {
      name: 'API Test User',
      email: 'apitest@example.com',
      subject: 'API Test Subject',
      message: 'This is a test message from the API',
      category: 'General Inquiry',
      status: 'new'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Insert error',
        details: insertError.message,
        code: insertError.code,
        selectWorks: true
      }, { status: 500 });
    }

    // Test 3: Clean up test record
    const { error: deleteError } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      tests: {
        select: 'PASSED',
        insert: 'PASSED',
        delete: deleteError ? 'FAILED' : 'PASSED'
      },
      insertData: insertData
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
