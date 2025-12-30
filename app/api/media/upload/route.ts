import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleError } from '@/lib/api-helpers'
import { uploadFile } from '@/lib/blob-storage'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    // Check content-length header first for early rejection
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'Le fichier est trop volumineux',
          message: 'La taille maximale autorisée est de 50 Mo. Veuillez compresser votre fichier ou en choisir un plus petit.',
          code: 'FILE_TOO_LARGE'
        }, 
        { status: 413 }
      )
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { 
          error: 'Le fichier est trop volumineux ou invalide',
          message: 'La taille maximale autorisée est de 50 Mo. Veuillez compresser votre fichier ou en choisir un plus petit.',
          code: 'FILE_TOO_LARGE'
        }, 
        { status: 413 }
      )
    }

    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { 
          error: 'Aucun fichier fourni',
          message: 'Veuillez sélectionner un fichier à télécharger.',
          code: 'NO_FILE'
        }, 
        { status: 400 }
      )
    }

    // Validate file type (images only - use /api/media/upload-video for videos)
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml'
    ]
    
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Type de fichier non autorisé',
          message: `Les formats acceptés sont: JPEG, PNG, WebP, AVIF, GIF, SVG. Pour les vidéos, utilisez l'endpoint dédié.`,
          code: 'INVALID_FILE_TYPE'
        }, 
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { 
          error: 'Fichier trop volumineux',
          message: `Votre fichier fait ${sizeMB} Mo. La taille maximale autorisée est de 50 Mo.`,
          code: 'FILE_TOO_LARGE'
        }, 
        { status: 413 }
      )
    }

    // Upload file using blob storage utility (optimization happens automatically)
    const result = await uploadFile(file, file.name, {
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
      format: result.format,
      wasOptimized: result.wasOptimized,
    })
  } catch (error) {
    console.error('Failed to upload file', error)
    
    // Check if it's a body size error
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { 
          error: 'Erreur de téléchargement',
          message: 'Le fichier est trop volumineux ou la connexion a été interrompue. Veuillez réessayer avec un fichier plus petit.',
          code: 'UPLOAD_ERROR'
        }, 
        { status: 413 }
      )
    }
    
    return handleError(error, 'Échec du téléchargement')
  }
}
