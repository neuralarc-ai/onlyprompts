import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;
    
    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    // First, delete all related likes for this prompt
    const { error: likesError } = await supabaseAdmin
      .from('likes')
      .delete()
      .eq('prompt_id', promptId);

    if (likesError) {
      console.error('Error deleting likes:', likesError);
      return NextResponse.json(
        { error: 'Failed to delete associated likes' },
        { status: 500 }
      );
    }

    // Then delete the prompt itself
    const { error: promptError } = await supabaseAdmin
      .from('prompts')
      .delete()
      .eq('id', promptId);

    if (promptError) {
      console.error('Error deleting prompt:', promptError);
      return NextResponse.json(
        { error: 'Failed to delete prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Prompt deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in delete prompt API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
