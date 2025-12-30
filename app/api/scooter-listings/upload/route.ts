import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/lib/api-helpers'
import { uploadFile } from '@/lib/blob-storage'

// Public upload endpoint for scooter listing images (no auth required)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (including AVIF support)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier invalide. Seules les images sont autorisées (JPEG, PNG, WebP, AVIF, GIF).' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'La taille du fichier dépasse la limite de 10MB' }, { status: 400 })
    }

    // Upload file using blob storage utility with a specific folder for scooter listings
    // Optimization happens automatically
    const result = await uploadFile(file, `scooter-listings/${file.name}`, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      optimize: true, // Enable image optimization
    })

    return NextResponse.json({
      url: result.url,
      pathname: result.pathname,
      size: result.size,
      uploadedAt: result.uploadedAt,
      // Optimization metadata
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      compressionRatio: result.compressionRatio,
      wasOptimized: result.wasOptimized,
    })
  } catch (error) {
    console.error('Failed to upload file', error)
    return handleError(error, 'Erreur lors de l\'upload du fichier')
  }
}
