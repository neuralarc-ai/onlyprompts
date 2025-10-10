'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useProfile, useProfileStats } from '@/hooks/useProfile';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PromptCard from '@/components/PromptCard';
import PromptModal from '@/components/PromptModal';
import type { Database } from '@/lib/supabase';

type Prompt = Database['public']['Tables']['prompts']['Row'];

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const { stats, loading: statsLoading } = useProfileStats(profile?.id);
  const { toggleFollow } = useFollow(user?.id);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get user's prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (promptsError) throw promptsError;
      setUserPrompts(promptsData || []);

      // Check if current user is following this profile
      if (user && profileData.id !== user.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !profile) return;

    setFollowLoading(true);
    const success = await toggleFollow(profile.id);
    if (success) {
      setIsFollowing(!isFollowing);
    }
    setFollowLoading(false);
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
                  <p className="text-gray-600">@{profile.username}</p>
                  {profile.bio && (
                    <p className="mt-2 text-gray-700">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    {profile.location && (
                      <span>📍 {profile.location}</span>
                    )}
                    {profile.website && (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-black hover:underline"
                      >
                        🌐 Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Follow Button */}
                {!isOwnProfile && user && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`mt-4 sm:mt-0 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-black text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {!statsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.promptsCount}</div>
                <div className="text-sm text-gray-600">Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.likesReceived}</div>
                <div className="text-sm text-gray-600">Likes Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.followersCount}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.followingCount}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
          )}
        </div>

        {/* User's Prompts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {isOwnProfile ? 'Your Prompts' : `${profile.username}'s Prompts`}
          </h2>
          
          {userPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPrompts.map((prompt) => (
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
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No prompts yet
              </h3>
              <p className="text-gray-600">
                {isOwnProfile 
                  ? "You haven't created any prompts yet. Start sharing your ideas!"
                  : `${profile.username} hasn't created any prompts yet.`
                }
              </p>
            </div>
          )}
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
