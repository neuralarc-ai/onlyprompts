'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptCard from '@/components/PromptCard';
import PromptModal from '@/components/PromptModal';
import { samplePrompts } from '@/data/samplePrompts';

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

const categories = [
  { name: 'Art & Design', icon: '🎨', count: 0, description: 'Creative visual prompts for art and design' },
  { name: 'Writing', icon: '✍️', count: 0, description: 'Content creation and writing prompts' },
  { name: 'Marketing', icon: '📢', count: 0, description: 'Marketing and advertising prompts' },
  { name: 'Code', icon: '💻', count: 0, description: 'Programming and development prompts' },
  { name: 'Photography', icon: '📸', count: 0, description: 'Photography and visual prompts' },
  { name: 'Music', icon: '🎵', count: 0, description: 'Music and audio creation prompts' },
  { name: 'Business', icon: '💼', count: 0, description: 'Business and professional prompts' },
  { name: 'Education', icon: '🎓', count: 0, description: 'Educational and learning prompts' },
  { name: 'Gaming', icon: '🎮', count: 0, description: 'Gaming and interactive prompts' },
  { name: 'Social Media', icon: '📱', count: 0, description: 'Social media content prompts' },
  { name: 'Productivity', icon: '⚡', count: 0, description: 'Productivity and efficiency prompts' },
];

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform sample prompts to match expected format
  const transformedPrompts = useMemo(() => {
    return samplePrompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      prompt: prompt.prompt,
      image_url: prompt.imageUrl,
      author: prompt.author,
      likes: prompt.likes,
      category: prompt.category,
      created_at: prompt.createdAt,
      updated_at: prompt.createdAt,
      tags: []
    }));
  }, []);

  // Calculate category counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(category => ({
      ...category,
      count: transformedPrompts.filter(prompt => prompt.category === category.name).length
    }));
  }, [transformedPrompts]);

  // Filter prompts by selected category
  const filteredPrompts = useMemo(() => {
    if (!selectedCategory) return [];
    return transformedPrompts.filter(prompt => prompt.category === selectedCategory);
  }, [selectedCategory, transformedPrompts]);

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
          {categoriesWithCounts.map((category) => (
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
          ))}
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

            {filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    id={prompt.id}
                    title={prompt.title}
                    description={prompt.description}
                    prompt={prompt.prompt}
                    imageUrl={prompt.image_url}
                    author={prompt.author}
                    likes={prompt.likes}
                    category={prompt.category}
                    createdAt={prompt.created_at}
                    onClick={() => handlePromptClick(prompt)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No prompts found
                </h3>
                <p className="text-gray-600">
                  We&apos;re working on adding more {selectedCategory.toLowerCase()} prompts.
                </p>
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

      {/* Modal */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prompt={selectedPrompt}
      />
    </div>
  );
}

