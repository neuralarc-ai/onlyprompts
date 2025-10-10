'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['user_profiles']['Row'];

export default function UsersPage() {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useFollow(user?.id);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId: string) => {
    setFollowLoading(userId);
    await toggleFollow(userId);
    setFollowLoading(null);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover
            <span className="text-black"> Creators</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with amazing creators and discover their AI prompts
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators..."
              className="w-full px-6 py-4 pl-14 pr-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
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
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userProfile) => (
            <div key={userProfile.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {userProfile.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-500">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {userProfile.full_name || userProfile.username}
                  </h3>
                  <p className="text-gray-600 text-sm">@{userProfile.username}</p>
                  {userProfile.bio && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {userProfile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              {user && user.id !== userProfile.id && (
                <div className="mt-4">
                  <button
                    onClick={() => handleFollowToggle(userProfile.id)}
                    disabled={followLoading === userProfile.id}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isFollowing(userProfile.id)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-black text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {followLoading === userProfile.id 
                      ? 'Loading...' 
                      : (isFollowing(userProfile.id) ? 'Following' : 'Follow')
                    }
                  </button>
                </div>
              )}

              {/* Profile Link */}
              <div className="mt-4">
                <a
                  href={`/profile/${userProfile.username}`}
                  className="text-black hover:underline text-sm font-medium"
                >
                  View Profile →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No creators found
            </h3>
            <p className="text-gray-600">
              Try searching with different keywords
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
