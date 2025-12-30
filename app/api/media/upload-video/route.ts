import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleError } from '@/lib/api-helpers'
import { uploadFile } from '@/lib/blob-storage'

// Maximum file size: 500MB for videos
const MAX_FILE_SIZE = 500 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    // Check content-length header first for early rejection
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'La vidéo est trop volumineuse',
          message: 'La taille maximale autorisée est de 500 Mo. Veuillez compresser votre vidéo ou en choisir une plus petite.',
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
          error: 'La vidéo est trop volumineuse ou invalide',
          message: 'La taille maximale autorisée est de 500 Mo. Veuillez compresser votre vidéo ou en choisir une plus petite.',
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
          message: 'Veuillez sélectionner une vidéo à télécharger.',
          code: 'NO_FILE'
        }, 
        { status: 400 }
      )
    }

    // Validate file type (videos only)
    const allowedVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska'
    ]
    
    if (!allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Type de fichier non autorisé',
          message: `Les formats vidéo acceptés sont: MP4, WebM, MOV, AVI, MKV.`,
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
          error: 'Vidéo trop volumineuse',
          message: `Votre vidéo fait ${sizeMB} Mo. La taille maximale autorisée est de 500 Mo.`,
          code: 'FILE_TOO_LARGE'
        }, 
        { status: 413 }
      )
    }

    // Upload video to blob storage (no optimization - will be processed by Mux)
    // IMPORTANT: Videos MUST use Vercel Blob (not local storage) because Mux needs publicly accessible URLs
    // Mux's servers cannot access localhost URLs, so we require Vercel Blob for videos
    try {
      const result = await uploadFile(file, file.name, {
        access: 'public',
        addRandomSuffix: true,
        contentType: file.type,
        skipOptimization: true, // Videos are processed by Mux, not Sharp
        requireBlobStorage: true, // Force Vercel Blob - localhost URLs won't work with Mux
      })

      // Verify the URL is publicly accessible (not localhost)
      if (result.url.startsWith('/') || result.url.includes('localhost')) {
        return NextResponse.json(
          { 
            error: 'Configuration requise',
            message: 'Le stockage Vercel Blob est requis pour les vidéos. Veuillez configurer BLOB_READ_WRITE_TOKEN dans vos variables d\'environnement.',
            code: 'BLOB_STORAGE_REQUIRED'
          }, 
          { status: 500 }
        )
      }

      return NextResponse.json({
        url: result.url,
        pathname: result.pathname,
        size: result.size,
        uploadedAt: result.uploadedAt,
      })
    } catch (uploadError) {
      // Handle the case where Vercel Blob is required but not available
      if (uploadError instanceof Error && uploadError.message.includes('Vercel Blob')) {
        return NextResponse.json(
          { 
            error: 'Configuration requise',
            message: 'Le stockage Vercel Blob est requis pour les vidéos. Veuillez configurer BLOB_READ_WRITE_TOKEN dans vos variables d\'environnement. Les vidéos ne peuvent pas être stockées localement car Mux nécessite des URLs publiquement accessibles.',
            code: 'BLOB_STORAGE_REQUIRED'
          }, 
          { status: 500 }
        )
      }
      throw uploadError // Re-throw other errors
    }

  } catch (error) {
    console.error('Failed to upload video', error)
    
    // Check if it's a body size error
    if (error instanceof Error && error.message.includes('body')) {
      return NextResponse.json(
        { 
          error: 'Erreur de téléchargement',
          message: 'La vidéo est trop volumineuse ou la connexion a été interrompue. Veuillez réessayer avec une vidéo plus petite.',
          code: 'UPLOAD_ERROR'
        }, 
        { status: 413 }
      )
    }
    
    return handleError(error, 'Échec du téléchargement de la vidéo')
  }
}

