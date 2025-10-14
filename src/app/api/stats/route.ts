import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get prompts count (only approved prompts)
    const { count: promptsCount } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'approved');

    // Get creators count (unique user_ids from approved prompts only)
    const { data: creatorsData } = await supabase
      .from('prompts')
      .select('user_id')
      .eq('approval_status', 'approved')
      .not('user_id', 'is', null);
    
    const uniqueCreators = new Set(creatorsData?.map(item => item.user_id) || []);
    const creatorsCount = uniqueCreators.size;

    // Get total likes count from likes table
    const { count: likesCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      prompts: promptsCount || 0,
      creators: creatorsCount,
      likes: likesCount || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
