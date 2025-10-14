'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStats } from '@/hooks/useStats';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { stats, loading, formatNumber } = useStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to homepage with search query
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Amazing
            <span className="text-black">
              {' '}AI Prompts
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore a curated collection of the best AI prompts for creative inspiration. 
            Find, share, and create prompts that unlock the full potential of AI.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for prompts, categories, or creators..."
                className="w-full px-6 py-4 pl-14 pr-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              <svg
                className="absolute left-5 top-4 h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-2 bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-full px-6 py-4 shadow-lg border border-gray-200 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : formatNumber(stats.prompts)}
              </div>
              <div className="text-gray-600 text-sm">Total AI prompts shared</div>
            </div>
            <div className="bg-white rounded-full px-6 py-4 shadow-lg border border-gray-200 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : formatNumber(stats.creators)}
              </div>
              <div className="text-gray-600 text-sm">Creators contributing</div>
            </div>
            <div className="bg-white rounded-full px-6 py-4 shadow-lg border border-gray-200 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : formatNumber(stats.likes)}
              </div>
              <div className="text-gray-600 text-sm">Total likes given</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

