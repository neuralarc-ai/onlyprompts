import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json()

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Verify connection configuration
    try {
      await transporter.verify()
      console.log('✅ SMTP server is ready to take our messages')
    } catch (error) {
      console.error('❌ SMTP server connection failed:', error)
      return NextResponse.json({ error: 'SMTP server connection failed' }, { status: 500 })
    }

    // Send email
    const mailOptions = {
      from: {
        name: 'OnlyPrompts Admin',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@onlyprompts.com'
      },
      to,
      subject,
      html,
      text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('📧 Email sent successfully:', info.messageId)

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    })
  } catch (error) {
    console.error('Error in send-email API:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
