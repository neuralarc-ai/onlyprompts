import { supabase } from './supabase'
import type { Database } from './supabase'

type PromptInsert = Database['public']['Tables']['prompts']['Insert']
type PromptUpdate = Database['public']['Tables']['prompts']['Update']

// Helper function to get a default image URL if none provided
const getDefaultImageUrl = (category: string): string => {
  const defaultImages = {
    'Art & Design': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop',
    'Writing': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop',
    'Marketing': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    'Code': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop',
    'Photography': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&h=300&fit=crop',
    'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
    'Business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
    'Education': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop',
    'Gaming': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&h=300&fit=crop',
    'Social Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
    'Productivity': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop'
  };
  
  return defaultImages[category as keyof typeof defaultImages] || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop';
};

export class DatabaseService {
  // Prompts
  static async getPrompts(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    // Ensure all prompts have valid image URLs
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : getDefaultImageUrl(prompt.category)
    }))
  }

  static async getPromptById(id: string) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    
    return {
      ...data,
      image_url: data.image_url && data.image_url.trim() !== '' 
        ? data.image_url 
        : getDefaultImageUrl(data.category)
    }
  }

  static async getPromptsByCategory(category: string, limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : getDefaultImageUrl(prompt.category)
    }))
  }

  static async getTrendingPrompts(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('likes', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : getDefaultImageUrl(prompt.category)
    }))
  }

  static async searchPrompts(query: string, limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,prompt.ilike.%${query}%,author.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : getDefaultImageUrl(prompt.category)
    }))
  }

  static async createPrompt(prompt: PromptInsert) {
    const { data, error } = await supabase
      .from('prompts')
      .insert([prompt])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePrompt(id: string, updates: PromptUpdate) {
    const { data, error } = await supabase
      .from('prompts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deletePrompt(id: string) {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Likes
  static async likePrompt(promptId: string, userId: string) {
    const { error } = await supabase
      .from('likes')
      .insert([{ prompt_id: promptId, user_id: userId }])

    if (error && error.code !== '23505') throw error // Ignore duplicate key error

    // Update prompt likes count
    const { error: updateError } = await supabase.rpc('increment_likes', {
      prompt_id: promptId
    })

    if (updateError) throw updateError
  }

  static async unlikePrompt(promptId: string, userId: string) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('prompt_id', promptId)
      .eq('user_id', userId)

    if (error) throw error

    // Update prompt likes count
    const { error: updateError } = await supabase.rpc('decrement_likes', {
      prompt_id: promptId
    })

    if (updateError) throw updateError
  }

  static async getUserLikes(userId: string) {
    const { data, error } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', userId)

    if (error) throw error
    return data.map(like => like.prompt_id)
  }

  static async isLiked(promptId: string, userId: string) {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found error
    return !!data
  }

  // Real-time subscriptions
  static subscribeToPrompts(callback: (payload: unknown) => void) {
    return supabase
      .channel('prompts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, callback)
      .subscribe()
  }

  static subscribeToLikes(callback: (payload: unknown) => void) {
    return supabase
      .channel('likes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, callback)
      .subscribe()
  }

  // Categories
  static async getCategories() {
    const { data, error } = await supabase
      .from('prompts')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error
    
    // Get unique categories with counts
    const categoryCounts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {})

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count: count as number
    }))
  }
}
