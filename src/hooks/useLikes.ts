'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useLikes(userId?: string) {
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch user's likes
  const fetchUserLikes = useCallback(async () => {
    console.log('useLikes - fetchUserLikes called:', { userId });
    
    if (!userId) {
      console.log('useLikes - No userId, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('useLikes - Getting session for fetch...');
      
      // Get session and access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      console.log('useLikes - Session for fetch:', { hasSession: !!sessionData.session, hasUser: !!sessionData.session?.user, hasToken: !!accessToken });
      
      if (!accessToken) {
        console.warn('useLikes - No access token for fetching likes');
        return;
      }

      console.log('useLikes - Fetching likes from API...');
      const response = await fetch(`/api/likes?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('useLikes - Fetch response status:', response.status);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('useLikes - Error fetching likes:', err?.error || response.statusText, err);
        return;
      }

      const result = await response.json();
      console.log('useLikes - Fetch result:', result);
      setUserLikes(new Set(result.likes || []));
    } catch (error) {
      console.error('useLikes - Error fetching user likes:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Toggle like/unlike
  const toggleLike = useCallback(async (promptId: string) => {
    console.log('useLikes - toggleLike called:', { promptId, userId, currentLikes: Array.from(userLikes) });
    
    if (!userId) {
      console.warn('useLikes - User not authenticated');
      return false;
    }

    try {
      const isLiked = userLikes.has(promptId);
      console.log('useLikes - Current like status:', { promptId, isLiked });

      // Use authenticated API route so server can enforce rules and update counts
      console.log('useLikes - Getting session...');
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('useLikes - Session data:', { hasSession: !!sessionData.session, hasUser: !!sessionData.session?.user });
      
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        console.warn('useLikes - Missing access token for like request');
        return false;
      }

      console.log('useLikes - Making API request...', { 
        promptId, 
        userId, 
        action: isLiked ? 'unlike' : 'like',
        hasToken: !!accessToken 
      });

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ promptId, userId, action: isLiked ? 'unlike' : 'like' }),
      });

      console.log('useLikes - API response status:', response.status);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('useLikes - Like API error:', err?.error || response.statusText, err);
        return false;
      }

      const result = await response.json();
      console.log('useLikes - Like API response:', result);

      if (isLiked) {
        console.log('useLikes - Removing like from local state');
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
        return false;
      }

      console.log('useLikes - Adding like to local state');
      setUserLikes(prev => new Set([...prev, promptId]));
      return true;
    } catch (error) {
      console.error('useLikes - Error toggling like:', error);
      return false;
    }
  }, [userId, userLikes]);

  // Check if a prompt is liked
  const isLiked = useCallback((promptId: string) => {
    return userLikes.has(promptId);
  }, [userLikes]);

  // Initial fetch
  useEffect(() => {
    fetchUserLikes();
  }, [fetchUserLikes]);

  // Real-time subscription for likes
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('likes_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'likes',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Real-time like update:', payload);
        
        if (payload.eventType === 'INSERT') {
          setUserLikes(prev => new Set([...prev, payload.new.prompt_id]));
        } else if (payload.eventType === 'DELETE') {
          setUserLikes(prev => {
            const newSet = new Set(prev);
            newSet.delete(payload.old.prompt_id);
            return newSet;
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    userLikes,
    loading,
    toggleLike,
    isLiked,
    refresh: fetchUserLikes
  };
}

