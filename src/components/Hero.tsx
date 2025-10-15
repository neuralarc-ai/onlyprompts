'use client';

import { useStats } from '@/hooks/useStats';

export default function Hero() {
  const { stats, loading, formatNumber } = useStats();


  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Share the <span className="bg-gray-200 px-2 rounded">prompts</span> behind the art. Discover trending AI images that inspire your next creation.
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            OnlyPrompts is the open gallery where AI artists share their secrets and curious fans discover what's possible. Browse the most-loved pieces, copy the exact prompts, and track the trends shaping generative art.
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-full px-8 py-6 shadow-lg border border-gray-200 text-center w-72 h-24 flex flex-col justify-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : formatNumber(stats.prompts)}
              </div>
              <div className="text-gray-600 text-sm">Total AI Prompts shared</div>
            </div>
            <div className="bg-white rounded-full px-8 py-6 shadow-lg border border-gray-200 text-center w-72 h-24 flex flex-col justify-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : formatNumber(stats.creators)}
              </div>
              <div className="text-gray-600 text-sm">Creators contributing</div>
            </div>
            <div className="bg-white rounded-full px-8 py-6 shadow-lg border border-gray-200 text-center w-72 h-24 flex flex-col justify-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {loading ? '...' : formatNumber(stats.likes)}
              </div>
              <div className="text-gray-600 text-sm">Total likes given</div>
            </div>
          </div>

          {/* Additional Call to Action */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              See what the community is creating and loving right now.
            </h2>
            <p className="text-lg text-gray-600">
              Every image comes with the exact prompt that created it. Skip the guesswork and learn directly from pieces that caught the community's attention.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

