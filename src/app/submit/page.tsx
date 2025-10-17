'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FormData {
  title: string;
  prompt: string;
  imageUrl: string;
  author: string;
  tags: string;
  imageFile: File | null;
  imageSource: 'url' | 'upload';
}

function SubmitPageContent() {
  const { user } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    prompt: '',
    imageUrl: '',
    author: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
    tags: '',
    imageFile: null,
    imageSource: 'url'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update author name when user changes
  useEffect(() => {
    if (user) {
      const userName = user.user_metadata?.username || user.email?.split('@')[0] || '';
      setFormData(prev => ({
        ...prev,
        author: userName
      }));
    }
  }, [user]);

  // Handle sessionStorage data for pre-filling form
  useEffect(() => {
    const storedData = sessionStorage.getItem('submitFormData');
    
    console.log('Checking sessionStorage for submitFormData:', storedData ? 'found' : 'not found');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('SessionStorage data received:', parsedData);
        console.log('Image URL from sessionStorage:', parsedData.imageUrl);

        // Check if data is recent (within last 10 minutes)
        const isRecent = Date.now() - parsedData.timestamp < 10 * 60 * 1000;
        console.log('Data is recent:', isRecent, 'Age:', Date.now() - parsedData.timestamp);
        
        if (isRecent && (parsedData.prompt || parsedData.imageUrl || parsedData.title || parsedData.tags)) {
          console.log('Pre-filling form with sessionStorage data');
          setIsPreFilled(true);
          setFormData(prev => {
            const newData = {
              ...prev,
              ...(parsedData.prompt && { prompt: parsedData.prompt }),
              ...(parsedData.imageUrl && { imageUrl: parsedData.imageUrl }),
              ...(parsedData.title && { title: parsedData.title }),
              ...(parsedData.tags && { tags: parsedData.tags }),
              imageSource: parsedData.imageUrl ? 'url' as const : prev.imageSource
            };
            console.log('Updated form data:', newData);
            console.log('Final imageUrl in form:', newData.imageUrl);
            return newData;
          });
          
          // Clear the stored data after using it
          sessionStorage.removeItem('submitFormData');
        } else {
          console.log('SessionStorage data is too old or invalid, ignoring');
          sessionStorage.removeItem('submitFormData');
        }
      } catch (error) {
        console.error('Error parsing sessionStorage data:', error);
        sessionStorage.removeItem('submitFormData');
      }
    }

    // Also check URL parameters as fallback
    const prompt = searchParams.get('prompt');
    const imageUrl = searchParams.get('imageUrl');
    const title = searchParams.get('title');
    const tags = searchParams.get('tags');

    if (prompt || imageUrl || title || tags) {
      console.log('URL parameters received as fallback:', { prompt, imageUrl, title, tags });
      setIsPreFilled(true);
      setFormData(prev => {
        const newData = {
          ...prev,
          ...(prompt && { prompt: decodeURIComponent(prompt) }),
          ...(imageUrl && { imageUrl: decodeURIComponent(imageUrl) }),
          ...(title && { title: decodeURIComponent(title) }),
          ...(tags && { tags: decodeURIComponent(tags) }),
          imageSource: imageUrl ? 'url' as const : prev.imageSource
        };
        console.log('Updated form data from URL:', newData);
        return newData;
      });
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      imageFile: file
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const file = files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image.`);
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleImageSourceChange = (source: 'url' | 'upload') => {
    setFormData(prev => ({
      ...prev,
      imageSource: source,
      imageFile: source === 'url' ? null : prev.imageFile,
      imageUrl: source === 'upload' ? '' : prev.imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Require authentication - show modal instead of throwing/redirecting
      if (!user) {
        setAuthModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      console.log('Session data:', sessionData);
      console.log('Access token:', accessToken ? 'Present' : 'Missing');

      if (!accessToken) {
        console.error('No access token found in session');
        router.push('/');
        throw new Error('Missing access token');
      }

      let finalImageUrl = formData.imageUrl;

      // Handle image upload if user selected file upload
      if (formData.imageSource === 'upload' && formData.imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || `Upload failed: ${uploadResponse.status}`;
          throw new Error(`Failed to upload image: ${errorMessage}`);
        }

        const uploadResult = await uploadResponse.json();
        finalImageUrl = uploadResult.url;
      }

      // Call the API to create the prompt
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: formData.title,
          prompt: formData.prompt,
          imageUrl: finalImageUrl,
          author: formData.author,
          tags: formData.tags,
          // userId will be set server-side from the verified token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Failed to submit prompt: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('Prompt created successfully:', result);
      setSubmitStatus('success');
      
      // Redirect to My Prompts page after a short delay
      setTimeout(() => {
        router.push('/my-prompts');
      }, 2000);
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Submit Your
              <span className="text-black">
                {' '}Prompt
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Share your creative AI prompts with the community. Help others discover new possibilities and get inspired by your ideas.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-black px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Share Your Prompt</h2>
            <p className="text-gray-300 mt-2">Fill out the form below to submit your AI prompt</p>
            {isPreFilled && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-300 text-sm font-medium">
                    Form pre-filled with generated content from Image Studio
                  </p>
                </div>
              </div>
            )}
            {isSuperAdmin && (
              <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-300 text-sm font-medium">
                    SuperAdmin: Your prompts will be automatically approved and published immediately
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Professional LinkedIn Post"
              />
            </div>


            {/* Full Prompt */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Full Prompt Text *
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter the complete prompt text here..."
              />
            </div>


            {/* Image Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Image Source *
              </label>
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => handleImageSourceChange('url')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.imageSource === 'url'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => handleImageSourceChange('upload')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.imageSource === 'upload'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Upload Image
                </button>
              </div>

              {/* Image URL Input */}
              {formData.imageSource === 'url' && (
                <div>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide a URL to an image that represents your prompt
                  </p>
                </div>
              )}

              {/* Image Upload Input */}
              {formData.imageSource === 'upload' && (
                <div>
                  {/* Drag and Drop Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('imageFile')?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <p className="text-gray-600 mb-2">
                        {isDragOver ? 'Drop your image here' : 'Drag & drop an image here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, GIF, WebP (max 10MB)
                      </p>
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    id="imageFile"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />

                  {/* Selected file info */}
                  {formData.imageFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="text-sm text-green-800 font-medium">
                            Selected: {formData.imageFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your name or username"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 shadow-lg'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
              </button>
            </div>
          </form>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="px-8 pb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-medium">
                    {isSuperAdmin ? 'Prompt submitted and auto-approved!' : 'Prompt submitted successfully!'}
                  </p>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {isSuperAdmin 
                    ? 'Your prompt has been automatically approved and is now live! Redirecting to your prompts page...'
                    : 'Your prompt has been saved and is pending approval. Redirecting to your prompts page...'
                  }
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="px-8 pb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-red-800 font-medium">Submission failed</p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Please try again. If the problem persists, contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Auth Required Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={() => {
            setAuthModalOpen(false)
          }}
        />

        {/* Guidelines */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Submission Guidelines</h3>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Ensure your prompt is clear, detailed, and produces high-quality results</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Use appropriate and respectful language in all prompts</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Provide an image that accurately represents your prompt&apos;s output</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>All submissions are reviewed before being published</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submit form...</p>
        </div>
      </div>
    }>
      <SubmitPageContent />
    </Suspense>
  );
}
