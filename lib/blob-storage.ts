/**
 * Blob Storage Utility
 * Handles file uploads using Vercel Blob in production and local storage in development
 */

import { put, del, list, head } from '@vercel/blob'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export interface UploadResult {
  url: string
  pathname: string
  size?: number
  uploadedAt?: Date
}

export interface BlobStorageConfig {
  access?: 'public' | 'private'
  addRandomSuffix?: boolean
  contentType?: string
}

/**
 * Check if Vercel Blob is available (production mode)
 */
export function isBlobStorageAvailable(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === 'production'
}

/**
 * Upload a file to storage (Vercel Blob in production, local in development)
 */
export async function uploadFile(
  file: File | Buffer,
  filename: string,
  config: BlobStorageConfig = {}
): Promise<UploadResult> {
  const {
    access = 'public',
    addRandomSuffix = true,
    contentType,
  } = config

  // Use Vercel Blob in production if token is available
  if (isBlobStorageAvailable()) {
    try {
      const blob = await put(filename, file, {
        access,
        addRandomSuffix,
        contentType: contentType || (file instanceof File ? file.type : undefined),
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }
    } catch (error) {
      console.error('Vercel Blob upload failed, falling back to local storage:', error)
      // Fall through to local storage
    }
  }

  // Fallback to local file storage for development
  const bytes = file instanceof File ? await file.arrayBuffer() : file
  const buffer = Buffer.from(bytes)

  // Generate unique filename
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(filename) || (file instanceof File ? path.extname(file.name) : '.bin')
  const uniqueFilename = `${timestamp}-${randomStr}${ext}`

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  // Write file
  const filePath = path.join(uploadsDir, uniqueFilename)
  await writeFile(filePath, buffer)

  // Return URL relative to public folder
  const url = `/uploads/${uniqueFilename}`

  return {
    url,
    pathname: uniqueFilename,
    size: buffer.length,
    uploadedAt: new Date(),
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(url: string): Promise<void> {
  // Check if it's a Vercel Blob URL
  if (url.startsWith('https://') && url.includes('.blob.vercel-storage.com')) {
    if (isBlobStorageAvailable()) {
      try {
        await del(url, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        return
      } catch (error) {
        console.error('Failed to delete from Vercel Blob:', error)
        throw error
      }
    }
  }

  // Delete from local storage
  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url)
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
    
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(url: string): Promise<boolean> {
  // Check Vercel Blob
  if (url.startsWith('https://') && url.includes('.blob.vercel-storage.com')) {
    if (isBlobStorageAvailable()) {
      try {
        await head(url, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        return true
      } catch {
        return false
      }
    }
  }

  // Check local storage
  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url)
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
    return existsSync(filePath)
  }

  return false
}

/**
 * List files in storage (Vercel Blob only)
 */
export async function listFiles(prefix?: string) {
  if (!isBlobStorageAvailable()) {
    throw new Error('File listing is only available with Vercel Blob')
  }

  return list({
    prefix,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

