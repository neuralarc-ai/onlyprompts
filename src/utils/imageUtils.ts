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

/**
 * Renders a placeholder image component
 */
export const ImagePlaceholder = ({ size = 'sm', text = 'No Image' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <svg
          className={`${sizeClasses[size]} text-gray-400 mx-auto mb-2`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
};




