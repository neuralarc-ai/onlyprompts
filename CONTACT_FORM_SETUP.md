# Contact Form Storage System Setup

This document explains how to set up the contact form storage system for your NanoB application.

## 🎯 What's Included

- **Database table** for storing contact messages
- **API endpoint** for form submissions
- **Admin interface** for managing messages
- **Real-time form validation** and error handling
- **Status tracking** (new, read, replied, closed)

## 📋 Setup Steps

### 1. Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of CONTACT_TABLE_SETUP.sql
-- This creates the contact_messages table with proper indexes and RLS policies
```

### 2. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Test the Contact Form

1. Go to `/contact` page
2. Fill out the form and submit
3. Check your Supabase dashboard to see the message in the `contact_messages` table

### 4. Access Admin Interface

1. Go to `/admin/contact` page
2. View and manage all contact messages
3. Filter by status (new, read, replied, closed)
4. Click "View" to see full message details
5. Use "Reply via Email" to respond to messages

## 🗄️ Database Schema

The `contact_messages` table includes:

- `id` - UUID primary key
- `name` - Contact person's name
- `email` - Contact email address
- `subject` - Message subject
- `message` - Full message content
- `category` - Message category (General Inquiry, Technical Support, etc.)
- `status` - Message status (new, read, replied, closed)
- `created_at` - Timestamp when message was created
- `updated_at` - Timestamp when message was last updated

## 🔧 API Endpoints

### POST `/api/contact`
Submit a new contact message

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about pricing",
  "message": "Hi, I would like to know more about your pricing plans.",
  "category": "General Inquiry"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact message sent successfully",
  "id": "uuid-here"
}
```

### GET `/api/contact`
Fetch contact messages (admin use)

**Query Parameters:**
- `status` - Filter by status (all, new, read, replied, closed)
- `limit` - Number of messages to return (default: 50)
- `offset` - Number of messages to skip (default: 0)

## 🎨 Features

### Contact Form (`/contact`)
- ✅ Real-time form validation
- ✅ Email format validation
- ✅ Required field validation
- ✅ Success/error feedback
- ✅ Form reset after successful submission
- ✅ Responsive design

### Admin Interface (`/admin/contact`)
- ✅ View all contact messages
- ✅ Filter by status
- ✅ Search and sort functionality
- ✅ Message detail modal
- ✅ Status management
- ✅ Direct email reply links
- ✅ Responsive table design

### Database Features
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamps
- ✅ Status tracking
- ✅ Optimized indexes for performance
- ✅ Data validation constraints

## 🔒 Security

- **RLS Policies**: Only authenticated users can read/update messages
- **Input Validation**: Server-side validation for all form fields
- **Email Validation**: Proper email format checking
- **SQL Injection Protection**: Using Supabase's built-in protection

## 📊 Usage Examples

### Using the Contact Hook

```typescript
import { useContactMessages } from '@/hooks/useContactMessages';

function MyComponent() {
  const { submitContactMessage, messages, loading, error } = useContactMessages({
    status: 'new',
    limit: 10
  });

  const handleSubmit = async (formData) => {
    const result = await submitContactMessage(formData);
    if (result.success) {
      console.log('Message sent!');
    } else {
      console.error('Error:', result.error);
    }
  };
}
```

### Direct API Usage

```typescript
// Submit a contact message
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question',
    message: 'Hello!',
    category: 'General Inquiry'
  })
});

// Fetch messages
const response = await fetch('/api/contact?status=new&limit=20');
const data = await response.json();
```

## 🚀 Next Steps

1. **Email Notifications**: Set up email alerts for new messages
2. **Auto-responders**: Create automatic replies for common questions
3. **Message Templates**: Add predefined response templates
4. **Analytics**: Track message volume and response times
5. **Integration**: Connect with external support tools

## 🐛 Troubleshooting

### Common Issues

1. **Messages not saving**: Check Supabase RLS policies
2. **API errors**: Verify environment variables
3. **Form validation**: Check required field validation
4. **Admin access**: Ensure user is authenticated

### Debug Steps

1. Check browser console for errors
2. Verify Supabase connection
3. Check database permissions
4. Test API endpoints directly

## 📝 Notes

- Messages are stored permanently in the database
- Admin interface requires authentication
- Form includes basic spam protection
- All timestamps are in UTC
- Email addresses are normalized to lowercase
