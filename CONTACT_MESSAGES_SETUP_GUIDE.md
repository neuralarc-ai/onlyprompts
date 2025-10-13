# Contact Messages Setup Guide

This guide will help you set up the contact messages system so that messages appear in the admin panel.

## 🚨 Issue
Contact messages are not showing up in the admin panel even though they are being saved to the database.

## 🔧 Solution Steps

### Step 1: Run the SQL Setup Script

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `CONTACT_MESSAGES_FIX.sql`
4. Run the script

This will:
- Create the `contact_messages` table if it doesn't exist
- Set up proper RLS policies
- Add sample data for testing
- Create necessary indexes

### Step 2: Verify Environment Variables

Make sure your `.env.local` file has the service role key:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Test the System

1. **Test the API directly:**
   - Visit: `http://localhost:3000/api/test-contact-messages`
   - This will verify the table exists and can be accessed

2. **Test the contact form:**
   - Go to `/contact` page
   - Fill out and submit the form
   - Check the browser console for any errors

3. **Test the admin panel:**
   - Go to `/admin/contact` page
   - You should see the contact messages

### Step 4: Check Browser Console

If messages still don't appear:

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Visit `/admin/contact`
4. Look for the API call to `/api/contact`
5. Check the response for any errors

### Step 5: Verify Database

1. Go to your Supabase Dashboard
2. Navigate to Table Editor
3. Look for the `contact_messages` table
4. Check if messages are being inserted when you submit the contact form

## 🔍 Troubleshooting

### Common Issues:

1. **"Table doesn't exist" error:**
   - Run the SQL setup script again
   - Check if the table was created in Supabase

2. **"Permission denied" error:**
   - The RLS policies might not be set up correctly
   - Run the SQL setup script to fix policies

3. **"Service role key not found" error:**
   - Check your `.env.local` file
   - Make sure `SUPABASE_SERVICE_ROLE_KEY` is set

4. **Messages save but don't appear in admin:**
   - The GET endpoint might be using the wrong Supabase client
   - The updated API now uses the service role for admin operations

## 📊 Expected Results

After setup, you should see:

1. **Contact form submissions** are saved to the database
2. **Admin panel** shows all contact messages
3. **Message status** can be updated (new, read, replied, closed)
4. **Filtering** works by status
5. **Sample data** appears for testing

## 🎯 Key Changes Made

1. **Updated API endpoint** to use service role for admin operations
2. **Fixed RLS policies** to allow proper access
3. **Added comprehensive SQL setup** script
4. **Created test endpoint** for debugging
5. **Added proper error handling** and logging

## 📝 Next Steps

Once the contact messages are working:

1. Test the full workflow: submit form → view in admin
2. Test status updates in the admin panel
3. Test filtering by status
4. Remove sample data if desired

The contact messages system should now be fully functional!
