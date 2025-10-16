'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptCard from '@/components/PromptCard';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';

// Tag categories inspired by Banana Prompts
const tagCategories = {
  'Artistic styles': [
    'Realistic', 'Cinematic', 'Anime', 'Architecture', 'Cartoon', '3D Render', 
    'Vector', 'Watercolor', 'Sketch / Line Art', 'Oil Painting', 'Abstract', 
    'Surreal', 'Fashion', 'Photography', 'Portrait'
  ],
  'Corporate & professional': [
    'Corporate', 'Business', 'Minimalist', 'Modern', 'Product / Poster', 
    'Logo', 'Infographic', 'Concept art'
  ],
  'Genre & themes': [
    'Fantasy', 'Sci-Fi', 'Cyberpunk', 'Retro / Vintage', 'Grunge'
  ],
  'Mood & tone': [
    'Vibrant / Colorful', 'Dark / Moody', 'Elegant'
  ],
  'Optional add-ons': [
    'Glitch', 'Neon', 'Flat Design'
  ]
};

export default function CategoriesPage() {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the prompts hook to get all approved prompts
  const { 
    prompts: allPrompts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePrompts({
    limit: 12
  });

  // Filter prompts based on selected tags - ALL selected tags must match
  const filteredPrompts = allPrompts.filter(prompt => {
    if (selectedTags.length === 0) return true;
    
    // Debug logging
    if (selectedTags.length > 0) {
      console.log('Filtering prompt:', prompt.title, 'Tags:', prompt.tags);
    }
    
    // Check if ALL selected tags match the prompt
    return selectedTags.every(tag => {
      const lowerTag = tag.toLowerCase();
      
      // Check if tag matches any of the prompt's tags (exact match or contains)
      const tagMatch = prompt.tags?.some(promptTag => 
        promptTag.toLowerCase() === lowerTag || 
        promptTag.toLowerCase().includes(lowerTag) ||
        lowerTag.includes(promptTag.toLowerCase())
      );
      
      
      // Check if tag matches title (contains)
      const titleMatch = prompt.title?.toLowerCase().includes(lowerTag);
      
      // Check if tag matches prompt content (contains)
      const promptMatch = prompt.prompt?.toLowerCase().includes(lowerTag);
      
      const matches = tagMatch || titleMatch || promptMatch;
      
      if (matches) {
        console.log(`Tag "${tag}" matched prompt "${prompt.title}"`);
      } else {
        console.log(`Tag "${tag}" did NOT match prompt "${prompt.title}"`);
      }
      
      return matches;
    });
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      
      console.log('Selected tags:', newTags);
      return newTags;
    });
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Inspired by Banana Prompts */}
      <section className="py-16 explore-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Keep exploring the prompts your peers are sharing.
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Scroll to load more AI-driven frames and the prompts that power them. Likes bubble the standouts to the top, so every new batch teaches a fresh technique.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
            {/* Refine Search Badge */}
            <div className="mb-4">
              <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide">
                Refine Search
              </span>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Find the next prompt to explore
                </h2>
                <p className="text-gray-600">
                  Blend keywords with style tags to surface prompts that match your vibe.
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1 lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search prompts, titles, or creators"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <button className="bg-black text-white px-6 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Browse Tags Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Browse Tags
                  </h3>
                  {selectedTags.length > 0 && (
                    <span className="bg-black text-white px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide">
                      {selectedTags.length} ACTIVE
                    </span>
                  )}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm"
                  >
                    Clear filters
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {Object.entries(tagCategories).map(([categoryName, tags]) => (
                <div key={categoryName}>
                  <h4 className="text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    {categoryName}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`tag-button px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          selectedTags.includes(tag)
                            ? 'selected'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Prompts Section */}
        <div>

          {/* Loading State */}
          {loading && filteredPrompts.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
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
                <div key={prompt.id} className="fade-in">
                  <PromptCard
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    prompt={prompt.prompt}
                    image_url={prompt.image_url}
                    author={prompt.author}
                    likes={prompt.likes}
                    created_at={prompt.created_at}
                    userId={user?.id}
                  />
                </div>
              ))}
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {selectedTags.length > 0 ? 'No prompts found for selected tags' : 'No prompts available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedTags.length > 0 
                  ? 'Try selecting different tags or clear the filters to see all prompts.'
                  : 'Be the first to submit a prompt!'
                }
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
          {filteredPrompts.length > 0 && hasMore && (
            <div className="text-center mt-12">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Prompts'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

