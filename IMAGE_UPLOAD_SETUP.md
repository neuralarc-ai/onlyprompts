# Image Upload Setup Guide

This guide explains how to set up image upload functionality for the NanoB application.

## 🎯 What's Been Implemented

### 1. **Submit Page Updates**
- ✅ Removed description field from the form
- ✅ Added image source selection (URL vs Upload)
- ✅ Added file upload input with validation
- ✅ Added image URL input option
- ✅ Updated form submission logic to handle both upload types

### 2. **Image Upload API**
- ✅ Created `/api/upload` endpoint for file uploads
- ✅ File type validation (JPG, PNG, GIF, WebP)
- ✅ File size validation (max 5MB)
- ✅ Secure upload to Supabase Storage
- ✅ User-specific file organization

### 3. **Database Updates**
- ✅ Updated API routes to remove description requirement
- ✅ Modified prompt creation to use prompt as description
- ✅ Added Supabase Storage configuration

### 4. **Storage Configuration**
- ✅ Created storage bucket for images
- ✅ Set up proper RLS policies for security
- ✅ Configured Next.js image domains

## 📋 Setup Steps

### 1. Run Storage Setup SQL

Execute the SQL commands in `STORAGE_SETUP.sql` in your Supabase SQL Editor:

```sql
-- This creates the 'images' storage bucket and sets up proper policies
-- Copy and paste the contents of STORAGE_SETUP.sql
```

### 2. Verify Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Test Image Upload

1. Go to `/submit` page
2. Select "Upload Image" option
3. Choose an image file (JPG, PNG, GIF, or WebP)
4. Fill out the form and submit
5. Check that the image appears in your prompt cards

### 4. Test Image URL

1. Go to `/submit` page
2. Select "Image URL" option
3. Enter a valid image URL
4. Fill out the form and submit
5. Verify the image displays correctly

## 🔧 How It Works

### Image Upload Flow
1. User selects "Upload Image" option
2. User chooses a file from their device
3. File is validated (type and size)
4. File is uploaded to Supabase Storage in user-specific folder
5. Public URL is returned and stored in database

### Image URL Flow
1. User selects "Image URL" option
2. User enters a valid image URL
3. URL is validated and stored directly in database

### Security Features
- **Authentication Required**: Only authenticated users can upload
- **User Isolation**: Each user's files are stored in separate folders
- **File Validation**: Type and size restrictions prevent abuse
- **RLS Policies**: Proper access control for storage operations

## 📁 File Organization

Uploaded images are organized as:
```
storage/images/
├── {user_id_1}/
│   ├── 1234567890-abc123.jpg
│   └── 1234567891-def456.png
├── {user_id_2}/
│   └── 1234567892-ghi789.webp
└── ...
```

## 🚨 Important Notes

1. **File Size Limit**: Maximum 5MB per image
2. **Supported Formats**: JPG, PNG, GIF, WebP only
3. **Storage Quota**: Monitor your Supabase storage usage
4. **Cleanup**: Consider implementing cleanup for deleted prompts

## 🔍 Troubleshooting

### Upload Fails
- Check file size (must be under 5MB)
- Verify file format is supported
- Ensure user is authenticated
- Check Supabase storage bucket exists

### Image Not Displaying
- Verify Next.js image domain configuration
- Check if image URL is accessible
- Ensure Supabase storage policies are correct

### Permission Errors
- Verify RLS policies are properly set
- Check user authentication status
- Ensure service role key is configured
