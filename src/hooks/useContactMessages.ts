import { useState, useEffect } from 'react';
import { Database } from '@/lib/supabase';

type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];

interface UseContactMessagesOptions {
  status?: 'all' | 'new' | 'read' | 'replied' | 'closed';
  limit?: number;
  offset?: number;
}

export function useContactMessages(options: UseContactMessagesOptions = {}) {
  const { status = 'all', limit = 50, offset = 0 } = options;
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (status !== 'all') {
        params.append('status', status);
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/contact?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.messages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [status, limit, offset]);

  const submitContactMessage = async (formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
  }) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    submitContactMessage,
  };
}
