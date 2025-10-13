'use client';

import { useState } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

export default function AssignSuperAdminPage() {
  const { isSuperAdmin, loading, error, assignSuperAdminRole } = useSuperAdmin();
  const [userEmail, setUserEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState('');
  const [assignError, setAssignError] = useState('');

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) return;

    try {
      setIsAssigning(true);
      setAssignError('');
      setMessage('');
      
      await assignSuperAdminRole(userEmail);
      setMessage(`SuperAdmin role successfully assigned to ${userEmail}`);
      setUserEmail('');
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign SuperAdmin role');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
    <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Assign SuperAdmin Role</h1>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-6">
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
                User Email Address
              </label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user's email address"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                The user must have an account in the system before assigning SuperAdmin role.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAssigning || !userEmail.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAssigning ? 'Assigning...' : 'Assign SuperAdmin Role'}
            </button>
          </form>

          {message && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {assignError && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{assignError}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• SuperAdmin role grants full access to approve/reject prompts</li>
              <li>• Only assign this role to trusted users</li>
              <li>• The user must already have an account in the system</li>
              <li>• SuperAdmin privileges are permanent until manually revoked</li>
            </ul>
          </div>
        </div>
    </div>
  );
}
