'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptCard from '@/components/PromptCard';
import AuthModal from '@/components/AuthModal';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';

export default function TrendingPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Use the prompts hook with trending enabled
  const { 
    prompts: trendingPrompts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePrompts({
    trending: true,
    limit: 12
  });

  // Modal functionality removed - now using direct navigation to prompt pages

  const handleLikeClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trending
              <span className="text-black">
                {' '}Prompts
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover the most popular and trending AI prompts that are capturing the community&apos;s attention right now.
            </p>
            
            {/* Trending Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">Most Liked</div>
                <div className="text-gray-600">Community favorites</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">Rising Fast</div>
                <div className="text-gray-600">Growing popularity</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">Top Rated</div>
                <div className="text-gray-600">Highest quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && trendingPrompts.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <button
              onClick={refresh}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Trending Prompts Grid */}
        {!loading && !error && trendingPrompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPrompts.map((prompt, index) => (
              <div key={prompt.id} className="relative">
                {/* Trending Badge */}
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                )}
                
                <PromptCard
                  id={prompt.id}
                  title={prompt.title}
                  description={prompt.description}
                  prompt={prompt.prompt}
                  image_url={prompt.image_url}
                  author={prompt.author}
                  likes={prompt.likes}
                  category={prompt.category}
                  created_at={prompt.created_at}
                  userId={user?.id}
                  onLikeClick={handleLikeClick}
                />
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && trendingPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trending prompts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to submit a prompt and start trending!
            </p>
            <button
              onClick={() => window.location.href = '/submit'}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Submit a Prompt
            </button>
          </div>
        )}

        {/* Load More Button */}
        {trendingPrompts.length > 0 && hasMore && (
          <div className="text-center mt-12">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Trending'}
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

