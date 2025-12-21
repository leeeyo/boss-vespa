import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleError } from '@/lib/api-helpers'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Check if Vercel Blob token is available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob in production
      const { put } = await import('@vercel/blob')
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
      })

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
      })
    } else {
      // Use local file storage for development
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const ext = path.extname(file.name) || '.jpg'
      const filename = `${timestamp}-${randomStr}${ext}`

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Write file
      const filePath = path.join(uploadsDir, filename)
      await writeFile(filePath, buffer)

      // Return URL relative to public folder
      const url = `/uploads/${filename}`

      return NextResponse.json({
        url,
        pathname: filename,
      })
    }
  } catch (error) {
    console.error('Failed to upload file', error)
    return handleError(error, 'Failed to upload file')
  }
}
