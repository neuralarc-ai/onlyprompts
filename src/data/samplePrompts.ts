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

export const samplePrompts: Prompt[] = [
  {
    id: '1',
    title: 'Cyberpunk Cityscape',
    description: 'A stunning futuristic city with neon lights and flying cars',
    prompt: 'A cyberpunk cityscape at night, neon lights reflecting on wet streets, flying cars in the sky, tall buildings with holographic advertisements, dark atmosphere with bright colorful accents, highly detailed, 4K resolution',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop',
    author: 'Alex Chen',
    likes: 1247,
    category: 'Art & Design',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Professional LinkedIn Post',
    description: 'Generate engaging professional content for LinkedIn',
    prompt: 'Write a professional LinkedIn post about [topic] that includes: a compelling hook in the first line, 3-4 key points with actionable insights, relevant industry statistics, a call-to-action, and professional but engaging tone. Keep it under 1500 characters.',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    author: 'Sarah Johnson',
    likes: 892,
    category: 'Marketing',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Fantasy Dragon Portrait',
    description: 'Majestic dragon with intricate details and magical aura',
    prompt: 'A majestic fantasy dragon portrait, ancient and wise looking, intricate scales with metallic reflections, glowing eyes, magical aura surrounding it, detailed facial features, fantasy art style, high contrast lighting, 8K resolution',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
    author: 'Mike Rodriguez',
    likes: 2156,
    category: 'Art & Design',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'React Component Generator',
    description: 'Generate clean, reusable React components with TypeScript',
    prompt: 'Generate a React component with TypeScript for [component name] that includes: proper TypeScript interfaces, clean JSX structure, responsive design with Tailwind CSS, accessibility features (ARIA labels, keyboard navigation), error handling, loading states, and comprehensive prop types. Include usage examples.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop',
    author: 'David Kim',
    likes: 1678,
    category: 'Code',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Product Photography Setup',
    description: 'Professional product photography lighting and composition',
    prompt: 'Create a professional product photography setup for [product type] with: soft, diffused lighting to eliminate harsh shadows, clean white background, proper depth of field, rule of thirds composition, multiple angles (front, side, detail shots), minimal and elegant styling, commercial photography quality',
    imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&h=300&fit=crop',
    author: 'Emma Wilson',
    likes: 934,
    category: 'Photography',
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    title: 'Creative Writing Exercise',
    description: 'Spark creativity with unique writing prompts and exercises',
    prompt: 'Create a creative writing exercise that helps writers: develop unique character voices, explore unconventional narrative structures, practice dialogue writing, experiment with different genres, overcome writer\'s block, and improve descriptive writing. Include specific examples and step-by-step instructions.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop',
    author: 'Lisa Thompson',
    likes: 743,
    category: 'Writing',
    createdAt: '2024-01-10'
  },
  {
    id: '7',
    title: 'Social Media Content Calendar',
    description: 'Plan and organize social media content strategy',
    prompt: 'Create a comprehensive social media content calendar for [business type] including: content themes for each day of the week, optimal posting times for different platforms, content mix (educational, promotional, entertaining), hashtag strategies, engagement tactics, and metrics to track. Plan for one month.',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=300&fit=crop',
    author: 'Tom Anderson',
    likes: 1156,
    category: 'Social Media',
    createdAt: '2024-01-09'
  },
  {
    id: '8',
    title: 'Minimalist Logo Design',
    description: 'Clean and modern logo design principles',
    prompt: 'Design a minimalist logo for [company name] that embodies: clean lines and simple shapes, timeless appeal, scalability for different sizes, strong brand recognition, appropriate color psychology, versatility across different media, and modern aesthetic. Focus on simplicity and memorability.',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop',
    author: 'Nina Patel',
    likes: 1456,
    category: 'Art & Design',
    createdAt: '2024-01-08'
  }
];
