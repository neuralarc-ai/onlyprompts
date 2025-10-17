import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('Uploading generated image to Supabase Storage...');

    // Check if it's a data URL
    if (!imageUrl.startsWith('data:')) {
      console.log('Not a data URL, returning original URL');
      return NextResponse.json({ url: imageUrl });
    }

    // Extract base64 data from data URL
    const base64Data = imageUrl.split(',')[1];
    const mimeType = imageUrl.split(';')[0].split(':')[1];
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `generated-images/${timestamp}-${Math.random().toString(36).substring(2)}.${mimeType.split('/')[1]}`;

    console.log('Uploading to Supabase Storage:', filename);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;
    console.log('Image uploaded successfully:', publicUrl);

    return NextResponse.json({ 
      url: publicUrl,
      filename: filename,
      success: true 
    });

  } catch (error) {
    console.error('Error uploading generated image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
