'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLikes } from '@/hooks/useLikes';

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  prompt: string;
  image_url?: string; // snake_case (from DB)
  imageUrl?: string;  // camelCase (from sample data)
  author: string;
  likes: number;
  category: string;
  created_at?: string; // snake_case (from DB)
  createdAt?: string;  // camelCase (from sample data)
  userId?: string;
}

export default function PromptCard({
  id,
  title,
  description,
  prompt,
  image_url,
  imageUrl,
  author,
  likes,
  category,
  created_at,
  createdAt,
  userId
}: PromptCardProps) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(likes);
  const [isCopied, setIsCopied] = useState(false);
  const { toggleLike, isLiked: userLiked } = useLikes(userId);

  const handleLike = async () => {
    console.log('PromptCard - handleLike called:', { id, userId, currentLikes: likeCount });
    
    if (!userId) {
      // Redirect to login or show auth modal
      console.log('PromptCard - User not authenticated, cannot like');
      return;
    }

    console.log('PromptCard - Calling toggleLike...');
    const success = await toggleLike(id);
    console.log('PromptCard - toggleLike result:', success);
    
    if (success) {
      setLikeCount(prev => prev + 1);
      console.log('PromptCard - Like count incremented');
    } else {
      setLikeCount(prev => Math.max(0, prev - 1));
      console.log('PromptCard - Like count decremented');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCardClick = () => {
    router.push(`/prompts/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const normalizedImageUrl = (image_url ?? imageUrl ?? '').trim()
  const normalizedCreatedAt = created_at ?? createdAt ?? ''

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 w-full">
        {normalizedImageUrl !== '' ? (
          (() => {
            let isAllowed = false
            try {
              const hostname = new URL(normalizedImageUrl).hostname
              // Hosts configured in next.config.ts
              const allowedHosts = new Set([
                'images.unsplash.com',
                'encrypted-tbn0.gstatic.com',
              ])
              isAllowed = allowedHosts.has(hostname)
            } catch {}

            return isAllowed ? (
              <Image
                src={normalizedImageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <img
                src={normalizedImageUrl}
                alt={title}
                className="object-cover w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )
          })()
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-2"
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
              <p className="text-sm text-gray-500">No Image</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-gray-700">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Prompt Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 line-clamp-3 font-mono">
            {prompt}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                userLiked(id)
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg
                className={`h-4 w-4 ${userLiked(id) ? 'fill-current' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isCopied 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-xs text-gray-500">
            by {author}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(normalizedCreatedAt)}</span>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="hover:text-gray-700 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
