# NodeMailer Email Notifications Setup

This guide explains how to set up email notifications using NodeMailer for super admins when new prompts are submitted.

## Prerequisites

Make sure you have NodeMailer installed:

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# NodeMailer SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@onlyprompts.com

# Site URL for email links
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## SMTP Provider Examples

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `SMTP_PASS`

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Features

✅ **NodeMailer Integration**: Direct SMTP email sending  
✅ **SMTP Verification**: Connection testing before sending  
✅ **Professional Templates**: HTML and text email versions  
✅ **Error Handling**: Graceful failure handling  
✅ **Multiple Recipients**: Send to all super admins  
✅ **Environment Configuration**: Easy setup via env vars  

## How It Works

1. **Prompt Submission**: User submits a prompt
2. **Database Save**: Prompt is saved to database
3. **Email Trigger**: System fetches super admin emails
4. **SMTP Connection**: NodeMailer connects to SMTP server
5. **Email Sent**: Professional notification sent to all super admins

## Email Template

The email includes:
- **Subject**: "New Prompt Submitted for Approval - [Title]"
- **Professional HTML**: Styled with prompt details
- **Direct Link**: To admin approval page
- **Prompt Content**: Full prompt text in formatted box
- **Author Info**: Prompt author and category

## Testing

### 1. Test SMTP Connection
```bash
# Add this to a test script
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter.verify().then(console.log).catch(console.error);
"
```

### 2. Test Email Sending
Submit a test prompt and check:
- Console logs for SMTP connection status
- Email delivery to super admin inboxes
- Email formatting and content

## Troubleshooting

### SMTP Connection Failed
- Verify SMTP credentials
- Check if 2FA is enabled (use App Password)
- Ensure SMTP port is correct
- Check firewall/network restrictions

### Emails Not Delivered
- Check spam/junk folders
- Verify sender email is valid
- Check SMTP server logs
- Ensure recipient emails are correct

### Authentication Errors
- Use App Password for Gmail
- Check username/password combination
- Verify SMTP server supports authentication

## Security Best Practices

1. **Environment Variables**: Never commit SMTP credentials to code
2. **App Passwords**: Use App Passwords instead of main passwords
3. **SMTP Security**: Use TLS/SSL when possible
4. **Rate Limiting**: Implement rate limiting for email sending
5. **Error Logging**: Log email failures for monitoring

## Production Considerations

1. **Email Service**: Consider using dedicated email services (SendGrid, AWS SES)
2. **Queue System**: Implement email queue for high volume
3. **Monitoring**: Set up email delivery monitoring
4. **Templates**: Use template engines for dynamic content
5. **Bounce Handling**: Implement bounce and complaint handling

## Example Usage

The system automatically sends emails when prompts are submitted. No manual intervention required.

```typescript
// This happens automatically in the prompts API
await EmailService.sendPromptApprovalNotification(
  {
    id: prompt.id,
    title: prompt.title,
    author: prompt.author,
    category: prompt.category,
    prompt: prompt.prompt
  },
  superAdminEmails
);
```

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify SMTP configuration
3. Test with a simple email first
4. Check email provider documentation
