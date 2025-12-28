import { NextResponse } from 'next/server'
import { getScooterModelsByType } from '@/lib/products'
import { getRecentBlogPosts } from '@/lib/blog'

export async function GET() {
  try {
    const [scooterModels, recentBlogPosts] = await Promise.all([
      getScooterModelsByType(),
      getRecentBlogPosts(6),
    ])

    return NextResponse.json({
      scooterModels,
      recentBlogPosts,
    })
  } catch (error) {
    console.error('Error fetching navigation data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation data' },
      { status: 500 }
    )
  }
}

