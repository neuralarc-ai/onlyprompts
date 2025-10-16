import { supabase } from './supabase'
import type { Database } from './supabase'

type PromptInsert = Database['public']['Tables']['prompts']['Insert']
type PromptUpdate = Database['public']['Tables']['prompts']['Update']

// Default image URL for prompts without images
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop';

export class DatabaseService {
  // Prompts
  static async getPrompts(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    // Ensure all prompts have valid image URLs
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : DEFAULT_IMAGE_URL
    }))
  }

  static async getPromptById(id: string) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('approval_status', 'approved')
      .single()

    if (error) throw error
    
    return {
      ...data,
      image_url: data.image_url && data.image_url.trim() !== '' 
        ? data.image_url 
        : DEFAULT_IMAGE_URL
    }
  }


  static async getTrendingPrompts(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('approval_status', 'approved')
      .order('likes', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : DEFAULT_IMAGE_URL
    }))
  }

  static async searchPrompts(query: string, limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('approval_status', 'approved')
      .or(`title.ilike.%${query}%,prompt.ilike.%${query}%,author.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    
    return data.map(prompt => ({
      ...prompt,
      image_url: prompt.image_url && prompt.image_url.trim() !== '' 
        ? prompt.image_url 
        : DEFAULT_IMAGE_URL
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


  // SuperAdmin functions
  static async isSuperAdmin(userId: string) {
    const { data, error } = await supabase
      .rpc('is_superadmin', { user_id: userId })

    if (error) throw error
    return data
  }

  static async getUserRole(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_role', { user_id: userId })

    if (error) throw error
    return data
  }

  static async getSuperAdminEmails() {
    const { data, error } = await supabase
      .from('super_admins')
      .select('email')

    if (error) throw error
    return data.map(admin => admin.email)
  }

  static async getPendingPrompts(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('pending_prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  static async approvePrompt(promptId: string, reviewerId: string) {
    const { error } = await supabase
      .rpc('approve_prompt', { 
        prompt_id: promptId, 
        reviewer_id: reviewerId 
      })

    if (error) throw error
  }

  static async rejectPrompt(promptId: string, reviewerId: string, reason?: string) {
    const { error } = await supabase
      .rpc('reject_prompt', { 
        prompt_id: promptId, 
        reviewer_id: reviewerId,
        reason: reason || null
      })

    if (error) throw error
  }

  static async getAllPrompts(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  static async getPromptsByStatus(status: 'pending' | 'approved' | 'rejected', limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('approval_status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }
}
