import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get reference images (for style reference)
    const referenceImages: File[] = [];
    for (let i = 0; i < 5; i++) {
      const image = formData.get(`referenceImage${i}`) as File;
      if (image) {
        console.log(`Found reference image ${i}:`, {
          name: image.name,
          size: image.size,
          type: image.type
        });
        referenceImages.push(image);
      }
    }
    
    console.log(`Total reference images found: ${referenceImages.length}`);

    // Initialize the Gemini model for image generation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image'
    });

    // Prepare content parts
    const contentParts: any[] = [];

    // Construct enhanced prompt that emphasizes reference image usage
    let enhancedPrompt = prompt;
    
    if (referenceImages.length > 0) {
      enhancedPrompt = `Generate an image based on the following prompt: "${prompt}". 

IMPORTANT: Use the provided reference image(s) as the primary visual guide for this generation. The reference image(s) should heavily influence the composition, style, colors, lighting, and overall visual elements of the generated image. 

Instructions:
- Analyze the reference image(s) carefully and incorporate their key visual elements
- Maintain the composition and layout structure from the reference image(s)
- Preserve the color palette, lighting, and mood from the reference image(s)
- Apply the style and artistic approach shown in the reference image(s)
- Use the reference image(s) as the foundation and enhance it according to the prompt

Reference image(s) are provided below. Generate an image that closely follows the visual guidance from these reference images while incorporating the elements described in the prompt.`;
    }

    // Add enhanced text prompt
    contentParts.push({ text: enhancedPrompt });

    // Add reference images for style guidance
    if (referenceImages.length > 0) {
      for (const image of referenceImages) {
        const arrayBuffer = await image.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        contentParts.push({
          inlineData: {
            data: base64,
            mimeType: image.type,
          },
        });
      }
    }

    // Generate image using Gemini
    console.log(`Generating image with ${contentParts.length} content parts (1 text + ${referenceImages.length} images)`);
    console.log('Enhanced prompt:', enhancedPrompt.substring(0, 200) + '...');
    
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    
    console.log('Generation completed, processing response...');

    // Extract the generated image
    let generatedImageBase64 = null;
    let generatedImageMimeType = 'image/png';

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      console.log(`Processing ${response.candidates[0].content.parts.length} response parts`);
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          console.log('Found generated image in response');
          generatedImageBase64 = part.inlineData.data;
          generatedImageMimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
    } else {
      console.log('No valid response candidates found');
    }

    if (!generatedImageBase64) {
      throw new Error('No image was generated');
    }

    // Convert base64 to data URL for immediate use
    const dataUrl = `data:${generatedImageMimeType};base64,${generatedImageBase64}`;

    return NextResponse.json({
      imageUrl: dataUrl,
      imageBase64: generatedImageBase64,
      mimeType: generatedImageMimeType,
      prompt: prompt,
      success: true,
      model: 'gemini-2.5-flash-image',
      referenceImagesCount: referenceImages.length
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}