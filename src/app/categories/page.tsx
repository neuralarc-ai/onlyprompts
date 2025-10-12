'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptCard from '@/components/PromptCard';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseService } from '@/lib/database';

const categories = [
  { name: 'Art & Design', icon: '🎨', description: 'Creative visual prompts for art and design' },
  { name: 'Writing', icon: '✍️', description: 'Content creation and writing prompts' },
  { name: 'Marketing', icon: '📢', description: 'Marketing and advertising prompts' },
  { name: 'Code', icon: '💻', description: 'Programming and development prompts' },
  { name: 'Photography', icon: '📸', description: 'Photography and visual prompts' },
  { name: 'Music', icon: '🎵', description: 'Music and audio creation prompts' },
  { name: 'Business', icon: '💼', description: 'Business and professional prompts' },
  { name: 'Education', icon: '🎓', description: 'Educational and learning prompts' },
  { name: 'Gaming', icon: '🎮', description: 'Gaming and interactive prompts' },
  { name: 'Social Media', icon: '📱', description: 'Social media content prompts' },
  { name: 'Productivity', icon: '⚡', description: 'Productivity and efficiency prompts' },
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<Array<{name: string, icon: string, count: number, description: string}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Use the prompts hook for the selected category
  const { 
    prompts: filteredPrompts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePrompts({
    category: selectedCategory || undefined,
    limit: 12
  });

  // Load category counts from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const dbCategories = await DatabaseService.getCategories();
        
        // Merge with predefined categories and add counts
        const mergedCategories = categories.map(category => {
          const dbCategory = dbCategories.find(db => db.name === category.name);
          return {
            ...category,
            count: dbCategory?.count || 0
          };
        });
        
        setCategoriesWithCounts(mergedCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        // Fallback to categories with 0 counts
        setCategoriesWithCounts(categories.map(cat => ({ ...cat, count: 0 })));
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Modal functionality removed - now using direct navigation to prompt pages

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Browse by
              <span className="text-black">
                {' '}Category
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore AI prompts organized by category. Find exactly what you&apos;re looking for, from creative arts to business applications.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {loadingCategories ? (
            // Loading state for categories
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="p-6 rounded-xl border-2 border-gray-200 bg-white animate-pulse">
                <div className="text-4xl mb-3">⏳</div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))
          ) : (
            categoriesWithCounts.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedCategory === category.name
                    ? 'border-black bg-gray-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {category.count} prompts
                  </span>
                  {selectedCategory === category.name && (
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Selected Category Results */}
        {selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory} Prompts
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>

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
                  No {selectedCategory.toLowerCase()} prompts available yet. Be the first to submit one!
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
        )}

        {/* All Categories Overview */}
        {!selectedCategory && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Choose a category to explore prompts
            </h2>
            <p className="text-gray-600 mb-8">
              Click on any category above to see the available prompts in that area.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {categoriesWithCounts.map((category) => (
                <div key={category.name} className="text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.count} prompts</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

