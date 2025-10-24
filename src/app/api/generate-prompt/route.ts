import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle JSON requests for title and tags generation
    if (contentType?.includes('application/json')) {
      const { prompt, type } = await request.json();
      
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash'
      });

      if (type === 'title_and_tags') {
        // Generate title and tags from the prompt
        const titlePrompt = `Based on this AI image generation prompt, create a short, catchy title (max 50 characters) and relevant tags (comma-separated, max 5 tags):

Prompt: "${prompt}"

Please respond in this exact JSON format:
{
  "title": "Your catchy title here",
  "tags": "tag1, tag2, tag3, tag4, tag5"
}

IMPORTANT: 
- Title should be max 50 characters
- Title should NOT contain asterisks (*) or any special formatting characters
- Tags must be comma-separated with spaces after commas (e.g., "portrait, studio, professional, lighting, editorial")
- Choose 3-5 relevant tags that describe the content, style, or subject matter
- Do not use quotes around individual tags, just separate with commas`;

        const result = await model.generateContent(titlePrompt);
        const response = await result.response;
        const generatedText = response.text();

        try {
          // Try to parse the JSON response
          const parsed = JSON.parse(generatedText);
          
          // Clean and validate tags
          let cleanTags = parsed.tags || 'ai, generated, prompt';
          if (typeof cleanTags === 'string') {
            // Remove extra quotes and ensure proper comma separation
            cleanTags = cleanTags.replace(/['"]/g, '').trim();
            // Ensure tags are comma-separated
            if (!cleanTags.includes(',')) {
              cleanTags = cleanTags.split(/\s+/).join(', ');
            }
          }
          
          // Clean title to remove any asterisks or special characters
          let cleanTitle = parsed.title || 'Generated Prompt';
          if (typeof cleanTitle === 'string') {
            cleanTitle = cleanTitle.replace(/[*]/g, '').trim();
          }
          
          return NextResponse.json({
            title: cleanTitle,
            tags: cleanTags,
            success: true
          });
        } catch (parseError) {
          // Fallback if JSON parsing fails
          const lines = generatedText.split('\n');
          let title = lines.find(line => line.includes('title'))?.split(':')[1]?.replace(/[",]/g, '').trim() || 'Generated Prompt';
          let tags = lines.find(line => line.includes('tags'))?.split(':')[1]?.replace(/["]/g, '').trim() || 'ai, generated, prompt';
          
          // Clean title to remove any asterisks
          title = title.replace(/[*]/g, '').trim();
          
          // Ensure tags are comma-separated in fallback too
          if (tags && !tags.includes(',')) {
            tags = tags.split(/\s+/).join(', ');
          }
          
          return NextResponse.json({
            title: title,
            tags: tags,
            success: true
          });
        }
      }
    }

    // Handle form data for image analysis (existing functionality)
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size must be less than 10MB' }, { status: 400 });
    }

    // Initialize the Gemini model for image understanding
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Prepare content with image and prompt instruction
    const contentParts = [
      {
        text: `Analyze this image and generate a detailed, creative prompt that could be used to recreate or describe this image using AI image generation. The prompt should be:

1. Descriptive and detailed
2. Include visual elements like composition, lighting, colors, style
3. Mention artistic techniques or photography terms if applicable
4. Be specific about the mood, atmosphere, or feeling
5. Include technical details like camera settings, lens type, or artistic style if relevant
6. Be written in a way that would work well for AI image generation tools

IMPORTANT: 
- Do NOT use asterisks (*) or any special formatting characters in the prompt
- Write the prompt in plain text without any markdown formatting
- Avoid bullet points, asterisks, or other special characters

Make the prompt engaging and comprehensive while being practical for image generation.`
      },
      {
        inlineData: {
          data: base64,
          mimeType: image.type,
        },
      }
    ];

    // Generate prompt using Gemini
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const generatedPrompt = response.text();

    if (!generatedPrompt) {
      throw new Error('No prompt was generated');
    }

    // Clean the generated prompt to remove any asterisks or special formatting
    const cleanedPrompt = generatedPrompt.replace(/[*]/g, '').trim();

    return NextResponse.json({
      prompt: cleanedPrompt,
      success: true,
      model: 'gemini-2.5-flash',
      imageName: image.name,
      imageSize: image.size,
      imageType: image.type
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
