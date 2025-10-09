'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptCard from '@/components/PromptCard';
import PromptModal from '@/components/PromptModal';
import { samplePrompts, Prompt } from '@/data/samplePrompts';

export default function TrendingPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort prompts by likes (most popular first)
  const trendingPrompts = useMemo(() => {
    return [...samplePrompts].sort((a, b) => b.likes - a.likes);
  }, []);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
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
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Prompts
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover the most popular and trending AI prompts that are capturing the community's attention right now.
            </p>
            
            {/* Trending Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">🔥</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">Most Liked</div>
                <div className="text-gray-600">Community favorites</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">📈</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">Rising Fast</div>
                <div className="text-gray-600">Growing popularity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">⭐</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">Top Rated</div>
                <div className="text-gray-600">Highest quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trending Prompts Grid */}
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
                imageUrl={prompt.imageUrl}
                author={prompt.author}
                likes={prompt.likes}
                category={prompt.category}
                createdAt={prompt.createdAt}
                onClick={() => handlePromptClick(prompt)}
              />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg">
            Load More Trending
          </button>
        </div>
      </main>

      <Footer />

      {/* Modal */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prompt={selectedPrompt}
      />
    </div>
  );
}
