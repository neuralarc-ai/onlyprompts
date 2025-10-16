'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function MyPromptsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    totalPrompts: 0,
    totalLikes: 0,
    avgLength: 0,
    lastUpdate: null as string | null,
  });
  const [userPrompts, setUserPrompts] = useState<{ id: string; title: string; description: string; prompt: string; likes: number; created_at: string; updated_at: string; tags: string[]; image_url: string; author: string; approval_status: 'pending' | 'approved' | 'rejected'; rejection_reason: string | null }[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchUserPrompts();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get user's approved prompts only for stats
      const { data: approvedPrompts, error: promptsError } = await supabase
        .from('prompts')
        .select('id, likes, prompt, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('approval_status', 'approved');

      if (promptsError) throw promptsError;

      const totalPrompts = approvedPrompts?.length || 0;
      const totalLikes = (approvedPrompts || []).reduce((acc: number, p: { likes?: number }) => acc + (p.likes || 0), 0);
      const avgLength = totalPrompts > 0 
        ? Math.round((approvedPrompts || []).reduce((acc: number, p: { prompt?: string }) => acc + (p.prompt?.split(' ').length || 0), 0) / totalPrompts) || 0
        : 0;
      const lastUpdate = totalPrompts > 0 
        ? new Date(Math.max(...(approvedPrompts || []).map((p: { updated_at: string }) => new Date(p.updated_at).getTime()))).toLocaleDateString()
        : null;

      setUserStats({ totalPrompts, totalLikes, avgLength, lastUpdate });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserPrompts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPrompts(data || []);
    } catch (error) {
      console.error('Error fetching user prompts:', error);
    }
  };

  useEffect(() => {
    fetchUserPrompts();
  }, [user]);

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'approved': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default: return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Prompts</h1>
              <p className="text-gray-600">Manage your prompt library and track your contributions</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Prompt Library */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-8 bg-white shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Prompt library</h2>
              </div>

              {userStats.totalPrompts === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100 ">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">You have not published any prompts yet</h3>
                  <p className="mb-6 text-gray-600 ">
                    Upload your first artwork to get started.
                  </p>
                  <button
                    onClick={() => router.push('/submit')}
                    className="bg-black  text-white  px-6 py-3 rounded-xl hover:bg-gray-800  transition-all duration-200 font-medium"
                  >
                    Share a new prompt
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-100 rounded-full p-4 border border-gray-200 shadow-sm">
                        <span className="text-sm text-gray-500">Prompts</span>
                        <div className="text-2xl font-bold">{userStats.totalPrompts}</div>
                      </div>
                      <div className="bg-gray-100 rounded-full p-4 border border-gray-200 shadow-sm">
                        <span className="text-sm text-gray-500">Avg length</span>
                        <div className="text-2xl font-bold">{userStats.avgLength} words</div>
                      </div>
                      <div className="bg-gray-100 rounded-full p-4 border border-gray-200 shadow-sm">
                        <span className="text-sm text-gray-500">Total likes</span>
                        <div className="text-2xl font-bold">{userStats.totalLikes}</div>
                      </div>
                      <div className="bg-gray-100 rounded-full p-4 border border-gray-200 shadow-sm">
                        <span className="text-sm text-gray-500">Last update</span>
                        <div className="text-2xl font-bold">{userStats.lastUpdate || '—'}</div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                      >
                        Most liked
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {userPrompts.map((prompt) => (
                      <div key={prompt.id} className="p-4 rounded-xl border bg-white border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{prompt.title}</h3>
                            <p className="text-sm mb-3 text-gray-600">
                              {prompt.prompt}
                            </p>
                          </div>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prompt.approval_status)}`}>
                            {getStatusIcon(prompt.approval_status)}
                            <span className="capitalize">{prompt.approval_status}</span>
                          </div>
                        </div>
                        
                        {prompt.approval_status === 'rejected' && prompt.rejection_reason && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                                <p className="text-sm text-red-700">{prompt.rejection_reason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {prompt.likes} likes
                          </span>
                          <span>{new Date(prompt.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="rounded-2xl p-6 bg-white  shadow-lg border border-gray-200 ">
              <h3 className="text-lg font-semibold mb-4">SIGNED IN AS</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-black  rounded-full flex items-center justify-center mr-4">
                  <span className="text-white  font-bold text-lg">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">
                    {user.user_metadata?.username || user.email?.split('@')[0]}
                  </div>
                  <div className="text-sm text-gray-600 ">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 ">MEMBER SINCE</span>
                  <span>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">APPROVED PROMPTS</span>
                  <span>{userStats.totalPrompts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 ">LAST UPDATE</span>
                  <span>{userStats.lastUpdate || '—'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gray-100 rounded-full p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="font-medium">{userStats.totalLikes} total likes</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">{userStats.totalPrompts} approved prompts</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => router.push('/submit')}
                  className="flex-1 bg-black  text-white  py-2 px-4 rounded-xl hover:bg-gray-800  transition-all duration-200 font-medium text-sm"
                >
                  Submit new prompt
                </button>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Sign out
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
