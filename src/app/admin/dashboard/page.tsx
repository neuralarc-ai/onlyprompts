'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  author: string;
  category: string;
  tags: string[];
  image_url: string;
  likes: number;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  author_email?: string;
}

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      checkSuperAdminStatus();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPrompts();
    }
  }, [isSuperAdmin]);

  // Handle filter changes without refetching
  useEffect(() => {
    if (allPrompts.length > 0) {
      let filteredData;
      if (filter === 'all') {
        filteredData = allPrompts;
      } else {
        filteredData = allPrompts.filter(p => p.approval_status === filter);
      }
      setPrompts(filteredData);
    }
  }, [filter, allPrompts]);

  const checkSuperAdminStatus = async () => {
    if (!user) return;
    
    try {
      const isAdmin = await DatabaseService.isSuperAdmin(user.id);
      setIsSuperAdmin(isAdmin);
      if (!isAdmin) {
        setError('Access denied. SuperAdmin role required.');
      }
    } catch (err) {
      console.error('Error checking SuperAdmin status:', err);
      setError('Failed to verify admin status');
    }
  };

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      // Always fetch all prompts first
      const allData = await DatabaseService.getAllPrompts(100, 0);
      setAllPrompts(allData);
      
      // Then filter based on current filter
      let filteredData;
      if (filter === 'all') {
        filteredData = allData;
      } else {
        filteredData = allData.filter(p => p.approval_status === filter);
      }
      
      setPrompts(filteredData);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (promptId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.approvePrompt(promptId, user.id);
      const updatedPrompt = { approval_status: 'approved' as const, reviewed_at: new Date().toISOString() };
      
      setAllPrompts(prev => 
        prev.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, ...updatedPrompt }
            : prompt
        )
      );
      
      setPrompts(prev => 
        prev.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, ...updatedPrompt }
            : prompt
        )
      );
    } catch (err) {
      console.error('Error approving prompt:', err);
      setError('Failed to approve prompt');
    }
  };

  const handleReject = async (promptId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.rejectPrompt(promptId, user.id, rejectReason);
      const updatedPrompt = { 
        approval_status: 'rejected' as const, 
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectReason
      };
      
      setAllPrompts(prev => 
        prev.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, ...updatedPrompt }
            : prompt
        )
      );
      
      setPrompts(prev => 
        prev.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, ...updatedPrompt }
            : prompt
        )
      );
      setShowRejectModal(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting prompt:', err);
      setError('Failed to reject prompt');
    }
  };

  const handleDelete = async (promptId: string) => {
    try {
      const response = await fetch(`/api/admin/prompts/${promptId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      // Remove the prompt from both states
      setAllPrompts(prev => prev.filter(prompt => prompt.id !== promptId));
      setPrompts(prev => prev.filter(prompt => prompt.id !== promptId));
      setShowDeleteModal(null);
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need SuperAdmin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage and approve prompts</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'pending', label: 'Pending', count: allPrompts.filter(p => p.approval_status === 'pending').length },
                { key: 'approved', label: 'Approved', count: allPrompts.filter(p => p.approval_status === 'approved').length },
                { key: 'rejected', label: 'Rejected', count: allPrompts.filter(p => p.approval_status === 'rejected').length },
                { key: 'all', label: 'All', count: allPrompts.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Prompts List */}
        <div className="space-y-6">
          {prompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No prompts found for the selected filter.</p>
            </div>
          ) : (
            prompts.map((prompt) => (
              <div key={prompt.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{prompt.title}</h3>
                    <p className="text-gray-600 mb-2">{prompt.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By: {prompt.author}</span>
                      <span>Category: {prompt.category}</span>
                      <span>Created: {new Date(prompt.created_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prompt.approval_status)}`}>
                        {prompt.approval_status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Prompt Content:</h4>
                  <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
                    {prompt.prompt}
                  </div>
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {prompt.rejection_reason && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-900 mb-2">Rejection Reason:</h4>
                    <p className="text-red-700 bg-red-50 rounded-md p-3 text-sm">
                      {prompt.rejection_reason}
                    </p>
                  </div>
                )}

                {prompt.approval_status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(prompt.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(prompt.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {prompt.approval_status === 'approved' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteModal(prompt.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Prompt</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Prompt</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this prompt? This action cannot be undone and will also remove all associated likes.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
