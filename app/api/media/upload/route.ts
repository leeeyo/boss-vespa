import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleError } from '@/lib/api-helpers'
import { uploadFile } from '@/lib/blob-storage'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (user instanceof NextResponse) return user

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Upload file using blob storage utility
    const result = await uploadFile(file, file.name, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })

    return NextResponse.json({
      url: result.url,
      pathname: result.pathname,
      size: result.size,
      uploadedAt: result.uploadedAt,
    })
  } catch (error) {
    console.error('Failed to upload file', error)
    return handleError(error, 'Failed to upload file')
  }
}
