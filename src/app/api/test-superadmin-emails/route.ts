import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing super admin emails fetch...')
    
    const superAdminEmails = await DatabaseService.getSuperAdminEmails()
    
    console.log('📧 Super admin emails found:', superAdminEmails)
    
    return NextResponse.json({
      success: true,
      count: superAdminEmails.length,
      emails: superAdminEmails
    })
  } catch (error) {
    console.error('❌ Error fetching super admin emails:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch super admin emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
