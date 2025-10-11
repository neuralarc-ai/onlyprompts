'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';


export function useFollow(currentUserId?: string) {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    fetchFollows();
  }, [currentUserId]);

  const fetchFollows = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);

      // Get users this user is following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      // Get users following this user
      const { data: followersData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentUserId);

      setFollowing(followingData?.map(f => f.following_id) || []);
      setFollowers(followersData?.map(f => f.follower_id) || []);
    } catch (error) {
      console.error('Error fetching follows:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userIdToFollow: string) => {
    if (!currentUserId || currentUserId === userIdToFollow) return false;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: userIdToFollow
        });

      if (error) throw error;

      setFollowing(prev => [...prev, userIdToFollow]);
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  };

  const unfollowUser = async (userIdToUnfollow: string) => {
    if (!currentUserId) return false;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userIdToUnfollow);

      if (error) throw error;

      setFollowing(prev => prev.filter(id => id !== userIdToUnfollow));
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  };

  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  const toggleFollow = async (userId: string) => {
    if (isFollowing(userId)) {
      return await unfollowUser(userId);
    } else {
      return await followUser(userId);
    }
  };

  return {
    following,
    followers,
    loading,
    followUser,
    unfollowUser,
    toggleFollow,
    isFollowing,
    refreshFollows: fetchFollows
  };
}
