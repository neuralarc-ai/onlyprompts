'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { DatabaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export function useSuperAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      checkSuperAdminStatus();
    } else if (!user && !authLoading) {
      setIsSuperAdmin(false);
      setLoading(false);
    }
  }, [user, authLoading]);

  const checkSuperAdminStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const isAdmin = await DatabaseService.isSuperAdmin(user.id);
      setIsSuperAdmin(isAdmin);
    } catch (err) {
      console.error('Error checking SuperAdmin status:', err);
      setError('Failed to verify admin status');
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const assignSuperAdminRole = async (userEmail: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await fetch('/api/admin/assign-superadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign SuperAdmin role');
      }

      return await response.json();
    } catch (err) {
      console.error('Error assigning SuperAdmin role:', err);
      throw err;
    }
  };

  return {
    isSuperAdmin,
    loading: authLoading || loading,
    error,
    assignSuperAdminRole,
    checkSuperAdminStatus
  };
}
