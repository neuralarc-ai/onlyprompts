'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CategoryFilter from '@/components/CategoryFilter';
import PromptCard from '@/components/PromptCard';
import PromptModal from '@/components/PromptModal';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';

function HomeContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<{ id: string; title: string; description: string; prompt: string; likes: number; created_at: string; updated_at: string; category: string; tags: string[]; image_url: string; author: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Get search query from URL
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Use the prompts hook with current filters
  const { 
    prompts: filteredPrompts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePrompts({
    category: selectedCategory,
    searchQuery: searchQuery || undefined,
    trending: false,
    limit: 12
  });

  const handlePromptClick = (prompt: { id: string; title: string; description: string; prompt: string; likes: number; created_at: string; updated_at: string; category: string; tags: string[]; image_url: string; author: string }) => {
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
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    Found {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && filteredPrompts.length === 0 && (
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

        {/* Prompts Grid */}
        {!loading && !error && filteredPrompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.description}
              prompt={prompt.prompt}
              image_url={prompt.image_url}
              author={prompt.author}
              likes={prompt.likes}
              category={prompt.category}
              created_at={prompt.created_at}
              onClick={() => handlePromptClick(prompt)}
              userId={user?.id}
            />
          ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No prompts found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No prompts match your search for "${searchQuery}". Try different keywords or browse all prompts.`
                : 'No prompts available in this category. Try selecting a different category.'
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Browse All Prompts
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredPrompts.length > 0 && hasMore && (
          <div className="text-center mt-12">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Prompts'}
            </button>
          </div>
        )}
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
