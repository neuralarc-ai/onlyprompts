export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  imageUrl: string;
  author: string;
  likes: number;
  category: string;
  createdAt: string;
}

// Sample prompts removed - now using database-only prompts
export const samplePrompts: Prompt[] = [];




