# Email Notifications Setup for Super Admins

This guide explains how to set up email notifications for super admins when new prompts are submitted for approval.

## Features Implemented

✅ **Email Service**: Created `EmailService` class for sending notifications  
✅ **API Route**: Added `/api/send-email` endpoint  
✅ **Database Integration**: Added `getSuperAdminEmails()` method  
✅ **Prompt Creation Integration**: Added email notification to prompt creation flow  
✅ **Database Setup**: Created SQL script for super admin email management  

## Setup Instructions

### 1. Database Setup

Run the SQL script to set up the super admin emails table:

```sql
-- Run this in your Supabase SQL editor
\i SUPERADMIN_EMAIL_SETUP.sql
```

Or manually execute the SQL commands from `SUPERADMIN_EMAIL_SETUP.sql`.

### 2. Add Super Admin Emails

Update the super admin emails in the database:

```sql
-- Add your super admin email addresses
INSERT INTO super_admins (email) VALUES 
  ('your-admin@email.com'),
  ('another-admin@email.com')
ON CONFLICT (email) DO NOTHING;
```

### 3. Email Service Configuration

The system is now configured to use NodeMailer for sending emails. To set up email sending:

#### Option A: Using NodeMailer (Current Implementation)

1. Install NodeMailer:
```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

2. Configure your SMTP settings in environment variables:
```env
# NodeMailer SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@onlyprompts.com
```

3. The system is already configured to use NodeMailer - no code changes needed!

#### Option B: Using Resend

1. Install Resend:
```bash
npm install resend
```

2. Get your API key from [Resend](https://resend.com)

3. Add to your environment variables:
```env
RESEND_API_KEY=your_resend_api_key
```

4. Update `src/lib/emailService.ts` to use Resend instead of NodeMailer.

#### Option C: Using SendGrid

1. Install SendGrid:
```bash
npm install @sendgrid/mail
```

2. Get your API key from [SendGrid](https://sendgrid.com)

3. Add to your environment variables:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

4. Update the email service accordingly.

#### Option D: Using AWS SES

1. Install AWS SDK:
```bash
npm install @aws-sdk/client-ses
```

2. Configure AWS credentials and update the email service.

### 4. Environment Variables

Add these to your `.env.local`:

```env
# NodeMailer SMTP Configuration (Current)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@onlyprompts.com

# Site URL for email links
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Alternative email services (if switching from NodeMailer)
# RESEND_API_KEY=your_resend_api_key
# SENDGRID_API_KEY=your_sendgrid_api_key
```

## How It Works

1. **Prompt Submission**: When a user submits a prompt via `/submit`
2. **Database Insert**: Prompt is saved to the `prompts` table
3. **Email Trigger**: System fetches super admin emails from `super_admins` table
4. **Notification Sent**: Email is sent to all super admins with prompt details
5. **Admin Review**: Super admins can review and approve via admin panel

## Email Template

The email includes:
- Prompt title, author, and category
- Full prompt text
- Direct link to admin approval page
- Professional HTML formatting

## Testing

To test the email notifications:

1. Set up the database with super admin emails
2. Submit a test prompt
3. Check the console logs for email details
4. Configure an actual email service to see real emails

## Troubleshooting

### No emails being sent
- Check if super admin emails are in the database
- Verify email service configuration
- Check console logs for errors

### Database errors
- Ensure RLS policies are set up correctly
- Verify super_admins table exists
- Check user permissions

### Email service errors
- Verify API keys are correct
- Check email service quotas
- Ensure sender email is verified

## Security Notes

- Super admin emails are protected by RLS policies
- Only authenticated users can read super admin emails
- Only super admins can manage the super admin list
- Email sending failures don't affect prompt creation

## Future Enhancements

- Email templates customization
- Email preferences for super admins
- Batch email notifications
- Email delivery status tracking
- SMS notifications as backup
