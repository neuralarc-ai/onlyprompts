// Email service for sending notifications using NodeMailer
import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static async createTransporter() {
    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log('✅ SMTP server is ready to take our messages');
      return transporter;
    } catch (error) {
      console.error('❌ SMTP server connection failed:', error);
      throw error;
    }
  }

  private static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      
      const mailOptions = {
        from: {
          name: 'OnlyPrompts Admin',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@onlyprompts.com'
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  static async sendPromptApprovalNotification(
    promptData: {
      id: string;
      title: string;
      author: string;
      category: string;
      prompt: string;
    },
    superAdminEmails: string[]
  ): Promise<boolean> {
    const subject = `New Prompt Submitted for Approval - ${promptData.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
          New Prompt Submitted for Approval
        </h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #000; margin-top: 0;">Prompt Details</h3>
          <p><strong>Title:</strong> ${promptData.title}</p>
          <p><strong>Author:</strong> ${promptData.author}</p>
          <p><strong>Category:</strong> ${promptData.category}</p>
          <p><strong>Prompt ID:</strong> ${promptData.id}</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Prompt Text:</h4>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap;">${promptData.prompt}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/prompts" 
             style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review & Approve Prompt
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This is an automated notification from OnlyPrompts Admin System.
        </p>
      </div>
    `;
    
    const text = `
New Prompt Submitted for Approval

Title: ${promptData.title}
Author: ${promptData.author}
Category: ${promptData.category}
Prompt ID: ${promptData.id}

Prompt Text:
${promptData.prompt}

Please review and approve at: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/prompts
    `;

    // Send to all super admin emails
    const emailPromises = superAdminEmails.map(email => 
      this.sendEmail({
        to: email,
        subject,
        html,
        text
      })
    );

    const results = await Promise.all(emailPromises);
    return results.every(result => result);
  }
}
