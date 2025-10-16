'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DatabaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

interface UsePromptsOptions {
  searchQuery?: string;
  trending?: boolean;
  limit?: number;
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const [prompts, setPrompts] = useState<{ id: string; title: string; description: string; prompt: string; likes: number; created_at: string; updated_at: string; tags: string[]; image_url: string; author: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const scrollPositionRef = useRef<number | null>(null);

  const { searchQuery, trending = false, limit = 50 } = options;

  const fetchPrompts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      
      let response;
      if (trending) {
        response = await DatabaseService.getTrendingPrompts(limit, currentOffset);
      } else if (searchQuery) {
        response = await DatabaseService.searchPrompts(searchQuery, limit, currentOffset);
      } else {
        response = await DatabaseService.getPrompts(limit, currentOffset);
      }

      if (reset) {
        setPrompts(response);
        setOffset(limit);
      } else {
        setPrompts(prev => [...prev, ...response]);
        setOffset(prev => prev + limit);
      }

      setHasMore(response.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, trending, limit, offset]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPrompts(false);
    }
  }, [loading, hasMore, fetchPrompts]);

  const loadAllPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Store current scroll position in ref
      scrollPositionRef.current = window.scrollY;
      
      let response;
      if (trending) {
        response = await DatabaseService.getAllTrendingPrompts();
      } else if (searchQuery) {
        response = await DatabaseService.searchAllPrompts(searchQuery);
      } else {
        response = await DatabaseService.getAllApprovedPrompts();
      }

      setPrompts(response);
      setHasMore(false); // No more prompts to load
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all prompts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, trending]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchPrompts(true);
  }, [fetchPrompts]);

  // Initial fetch
  useEffect(() => {
    setOffset(0);
    fetchPrompts(true);
  }, [searchQuery, trending]);

  // Restore scroll position after prompts are loaded
  useEffect(() => {
    if (scrollPositionRef.current !== null && !loading) {
      // Use multiple approaches to ensure scroll position is restored
      const restoreScroll = () => {
        if (scrollPositionRef.current !== null) {
          window.scrollTo(0, scrollPositionRef.current);
          scrollPositionRef.current = null; // Clear after restoring
        }
      };
      
      // Try immediately and with delays to ensure it works
      requestAnimationFrame(() => {
        restoreScroll();
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 200);
      });
    }
  }, [prompts, loading]);

  // Real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('prompts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'prompts' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        
        if (payload.eventType === 'INSERT') {
          setPrompts(prev => [payload.new as any, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPrompts(prev => 
            prev.map(prompt => 
              prompt.id === payload.new.id ? payload.new as any : prompt
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setPrompts(prev => 
            prev.filter(prompt => prompt.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    prompts,
    loading,
    error,
    hasMore,
    loadMore,
    loadAllPrompts,
    refresh
  };
}





