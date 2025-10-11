/**
 * Utility functions for handling image URLs
 */

/**
 * Validates if an image URL is valid and not empty
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  return !!(url && url.trim() !== '');
};

/**
 * Gets a default image URL based on category
 */
export const getDefaultImageUrl = (category: string): string => {
  const defaultImages: Record<string, string> = {
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
  
  return defaultImages[category] || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop';
};

/**
 * Gets a safe image URL - returns the provided URL if valid, otherwise returns a default
 */
export const getSafeImageUrl = (url: string | null | undefined, category: string): string => {
  return isValidImageUrl(url) ? url! : getDefaultImageUrl(category);
};





