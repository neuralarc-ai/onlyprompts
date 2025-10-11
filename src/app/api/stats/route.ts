import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get prompts count
    const { count: promptsCount } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    // Get creators count (unique user_ids from prompts)
    const { data: creatorsData } = await supabase
      .from('prompts')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const uniqueCreators = new Set(creatorsData?.map(item => item.user_id) || []);
    const creatorsCount = uniqueCreators.size;

    // Get categories count (unique categories from prompts)
    const { data: categoriesData } = await supabase
      .from('prompts')
      .select('category')
      .not('category', 'is', null);
    
    const uniqueCategories = new Set(categoriesData?.map(item => item.category) || []);
    const categoriesCount = uniqueCategories.size;

    return NextResponse.json({
      prompts: promptsCount || 0,
      creators: creatorsCount,
      categories: categoriesCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
