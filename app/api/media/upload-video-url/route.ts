import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-helpers'

/**
 * This endpoint is a workaround for Vercel's 4.5MB API route limit.
 * For files larger than 4.5MB, consider:
 * 1. Upgrading to Vercel Pro (higher limits)
 * 2. Using chunked uploads
 * 3. Using a different storage service (S3, Cloudflare R2)
 * 
 * For now, this endpoint validates the request and returns an error
 * with instructions for large files.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { size } = body

    // Vercel's API route limit is 4.5MB
    const VERCEL_LIMIT = 4.5 * 1024 * 1024
    
    if (size && size > VERCEL_LIMIT) {
      return NextResponse.json(
        { 
          error: 'Fichier trop volumineux pour l\'upload direct',
          message: `Les fichiers de plus de ${(VERCEL_LIMIT / (1024 * 1024)).toFixed(1)} Mo nécessitent un plan Vercel Pro ou une solution d'upload par chunks. Veuillez compresser votre vidéo ou utiliser un fichier plus petit.`,
          code: 'FILE_TOO_LARGE_FOR_API',
          maxSize: VERCEL_LIMIT,
        }, 
        { status: 413 }
      )
    }

    return NextResponse.json({ message: 'Use /api/media/upload-video for files under 4.5MB' })
  } catch (error) {
    console.error('Error in upload-video-url', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

