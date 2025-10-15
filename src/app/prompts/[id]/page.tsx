'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DatabaseService } from '@/lib/database';
import { useLikes } from '@/hooks/useLikes';
import { useAuth } from '@/hooks/useAuth';

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  image_url: string;
  author: string;
  likes: number;
  category: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { isLiked, toggleLike } = useLikes(user?.id);

  useEffect(() => {
    if (params.id) {
      fetchPrompt();
    }
  }, [params.id]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      setError(null);
      const promptData = await DatabaseService.getPromptById(params.id as string);
      setPrompt(promptData);
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Prompt not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleBackToGallery = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prompt...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Prompt Not Found</h1>
            <p className="text-gray-600 mb-6">The prompt you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={handleBackToGallery}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Gallery
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to gallery link */}
        <div className="mb-6">
          <button
            onClick={handleBackToGallery}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to gallery</span>
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left section - Image */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gray-100">
              {prompt.image_url && prompt.image_url.trim() !== '' ? (
                <img
                  src={prompt.image_url}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div class="text-center">
                            <svg class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-gray-500">Image failed to load</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="h-16 w-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500">No Image Available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right section - Prompt details */}
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              {/* Prompt Detail label */}
              <div className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full inline-block">
                PROMPT DETAIL
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {prompt.title}
              </h1>

              {/* Author */}
              <p className="text-lg text-gray-600">
                Shared by @{prompt.author}
              </p>

              {/* Prompt section with box */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">PROMPT</h2>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {prompt.prompt}
                  </p>
                </div>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isCopied 
                    ? 'bg-black text-white' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{isCopied ? 'Copied!' : 'Copy prompt'}</span>
              </button>

              {/* Like count with box */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 text-gray-600">
                  <button
                    onClick={() => prompt && toggleLike(prompt.id)}
                    className={`flex items-center space-x-2 ${
                      prompt && isLiked(prompt.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    } transition-colors`}
                  >
                    <svg
                      className={`h-6 w-6 ${prompt && isLiked(prompt.id) ? 'fill-current' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <span className="font-medium">{prompt?.likes || 0} LIKES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
