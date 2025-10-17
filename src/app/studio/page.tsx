'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ImageStudioPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<{imageUrl: string, prompt: string, hasInputImage: boolean} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputImageRef = useRef<HTMLInputElement>(null);

  const handleInputImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert(`File ${file.name} is not an image.`);
      return;
    }
    
    setInputImage(file);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5); // Max 5 files
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });
    
    setReferenceImages(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeInputImage = () => {
    setInputImage(null);
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('aspectRatio', aspectRatio);
      
      if (inputImage) {
        formData.append('inputImage', inputImage);
      }
      
      referenceImages.forEach((file, index) => {
        formData.append(`referenceImage${index}`, file);
      });

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage({
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        hasInputImage: data.hasInputImage
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            IMAGE STUDIO
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generate polished AI visuals in seconds.
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Keep the focus on prompt crafting and reviewing results—everything else stays out of the way.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            {/* Prompt Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={inputImage ? "Describe how you want to edit the uploaded image..." : "Describe the scene, lens, lighting, and styling you want to see."}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>

            {/* Aspect Ratio Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspect Ratio</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '1:1', label: 'Square' },
                  { value: '16:9', label: 'Wide' },
                  { value: '4:3', label: 'Standard' },
                  { value: '3:2', label: 'Photo' },
                  { value: '9:16', label: 'Portrait' },
                  { value: '21:9', label: 'Ultra Wide' }
                ].map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      aspectRatio === ratio.value
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Images Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reference images</h3>
              <p className="text-sm text-gray-600 mb-4">Optional - max 5 - 10MB each</p>
              
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-gray-600">Drag & drop, or click to upload images</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              {/* Uploaded Images Preview */}
              {referenceImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {referenceImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Image Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Input Image (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">Upload an image to edit with your prompt</p>
              
              {inputImage ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(inputImage)}
                    alt="Input image"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeInputImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => inputImageRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-gray-600">Click to upload an image to edit</p>
                  </div>
                </div>
              )}

              <input
                ref={inputImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleInputImageUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Image</h3>
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
                <p className="text-gray-600">Generating image with Gemini AI...</p>
                <p className="text-sm text-gray-500 mt-2">
                  {inputImage ? 'Editing your uploaded image...' : 'Creating a new image from your prompt...'}
                </p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage.imageUrl}
                  alt="Generated image"
                  className="w-full rounded-lg shadow-sm"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    {generatedImage.hasInputImage ? 'Image Edited with:' : 'Generated with prompt:'}
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">{generatedImage.prompt}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage.imageUrl;
                      link.download = `generated-image-${Date.now()}.png`;
                      link.click();
                    }}
                    className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-gray-500 mb-2">Your generated image will appear here.</p>
                <p className="text-sm text-gray-400">
                  {inputImage 
                    ? 'Upload an image and describe how you want to edit it, or generate a new image from scratch.'
                    : 'Describe what you want to see and Gemini AI will create it for you.'
                  }
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-black text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating 
              ? 'Generating...' 
              : inputImage 
                ? 'Edit Image' 
                : 'Generate Image'
            }
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
