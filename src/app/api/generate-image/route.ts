import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const aspectRatio = formData.get('aspectRatio') as string || '1:1';

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get input image for editing (if provided)
    const inputImage = formData.get('inputImage') as File;
    
    // Get reference images (for style reference)
    const referenceImages: File[] = [];
    for (let i = 0; i < 5; i++) {
      const image = formData.get(`referenceImage${i}`) as File;
      if (image) {
        referenceImages.push(image);
      }
    }

    // Initialize the Gemini model for image generation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image'
    });

    // Prepare content parts
    const contentParts: any[] = [];

    // Add text prompt
    contentParts.push({ text: prompt });

    // Add input image for editing if provided
    if (inputImage) {
      const arrayBuffer = await inputImage.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      contentParts.push({
        inlineData: {
          data: base64,
          mimeType: inputImage.type,
        },
      });
    }

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
    const result = await model.generateContent(contentParts);
    const response = await result.response;

    // Extract the generated image
    let generatedImageBase64 = null;
    let generatedImageMimeType = 'image/png';

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data;
          generatedImageMimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }
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
      aspectRatio: aspectRatio,
      success: true,
      model: 'gemini-2.5-flash-image',
      hasInputImage: !!inputImage,
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