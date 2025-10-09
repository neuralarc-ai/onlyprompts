import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promptId, userId, action } = body

    if (!promptId || !userId) {
      return NextResponse.json(
        { error: 'Missing promptId or userId' },
        { status: 400 }
      )
    }

    if (action === 'like') {
      await DatabaseService.likePrompt(promptId, userId)
    } else if (action === 'unlike') {
      await DatabaseService.unlikePrompt(promptId, userId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "like" or "unlike"' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const promptId = searchParams.get('promptId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    if (promptId) {
      // Check if specific prompt is liked
      const isLiked = await DatabaseService.isLiked(promptId, userId)
      return NextResponse.json({ isLiked })
    } else {
      // Get all user likes
      const likes = await DatabaseService.getUserLikes(userId)
      return NextResponse.json({ likes })
    }
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    )
  }
}
