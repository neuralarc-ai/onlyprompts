'use client';

import { useState, useEffect } from 'react';

interface Stats {
  prompts: number;
  creators: number;
  likes: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    prompts: 0,
    creators: 0,
    likes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toString();
  };

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
    formatNumber
  };
}
