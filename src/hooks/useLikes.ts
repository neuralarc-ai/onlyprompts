'use client';

import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export function useLikes(userId?: string) {
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch user's likes
  const fetchUserLikes = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const likes = await DatabaseService.getUserLikes(userId);
      setUserLikes(new Set(likes));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Toggle like/unlike
  const toggleLike = useCallback(async (promptId: string) => {
    if (!userId) {
      console.warn('User not authenticated');
      return false;
    }

    try {
      const isLiked = userLikes.has(promptId);
      
      if (isLiked) {
        await DatabaseService.unlikePrompt(promptId, userId);
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(promptId);
          return newSet;
        });
      } else {
        await DatabaseService.likePrompt(promptId, userId);
        setUserLikes(prev => new Set([...prev, promptId]));
      }
      
      return !isLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
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
