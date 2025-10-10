'use client';

import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

interface UsePromptsOptions {
  category?: string;
  searchQuery?: string;
  trending?: boolean;
  limit?: number;
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const { category, searchQuery, trending = false, limit = 50 } = options;

  const fetchPrompts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      
      let response;
      if (trending) {
        response = await DatabaseService.getTrendingPrompts(limit, currentOffset);
      } else if (category && category !== 'All') {
        response = await DatabaseService.getPromptsByCategory(category, limit, currentOffset);
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
  }, [category, searchQuery, trending, limit, offset]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPrompts(false);
    }
  }, [loading, hasMore, fetchPrompts]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchPrompts(true);
  }, [fetchPrompts]);

  // Initial fetch
  useEffect(() => {
    setOffset(0);
    fetchPrompts(true);
  }, [category, searchQuery, trending]);

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
          setPrompts(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPrompts(prev => 
            prev.map(prompt => 
              prompt.id === payload.new.id ? payload.new : prompt
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
    refresh
  };
}


