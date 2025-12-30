/**
 * Blob Storage Utility
 * Handles file uploads using Vercel Blob in production and local storage in development
 * Includes automatic image optimization using Sharp
 */

import { put, del, list, head } from '@vercel/blob'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { optimizeImage, getMimeType, getExtension, isImageContentType, formatBytes } from './image-optimization'

export interface UploadResult {
  url: string
  pathname: string
  size?: number
  uploadedAt?: Date
  // Optimization metadata
  originalSize?: number
  optimizedSize?: number
  compressionRatio?: number
  format?: string
  wasOptimized?: boolean
}

export interface BlobStorageConfig {
  access?: 'public' // Vercel Blob only supports 'public' access
  addRandomSuffix?: boolean
  contentType?: string
  // Image optimization options
  optimize?: boolean // Default: true for images
  skipOptimization?: boolean // Force skip optimization
  // Require Vercel Blob (fail if not available) - needed for services like Mux that need publicly accessible URLs
  requireBlobStorage?: boolean
}

/**
 * Check if Vercel Blob is available
 * Uses Vercel Blob if token is available, regardless of environment
 * This allows testing Vercel Blob in development if needed
 */
export function isBlobStorageAvailable(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

/**
 * Upload a file to storage (Vercel Blob in production, local in development)
 * Automatically optimizes images before upload
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
    optimize = true,
    skipOptimization = false,
    requireBlobStorage = false,
  } = config

  // If blob storage is required but not available, throw an error
  if (requireBlobStorage && !isBlobStorageAvailable()) {
    throw new Error('Vercel Blob storage is required but not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.')
  }

  // Determine content type
  const fileContentType = contentType || (file instanceof File ? file.type : undefined)
  const isImage = fileContentType ? isImageContentType(fileContentType) : false
  
  // Convert to buffer for optimization
  let buffer: Buffer
  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer())
  } else if (Buffer.isBuffer(file)) {
    buffer = file
  } else {
    buffer = Buffer.from(file)
  }
  
  const originalSize = buffer.length
  let uploadBuffer = buffer
  let uploadContentType = fileContentType
  let uploadFilename = filename
  let wasOptimized = false
  let compressionRatio = 0
  let outputFormat: string | undefined
  
  // Optimize image if applicable
  if (isImage && optimize && !skipOptimization) {
    try {
      const result = await optimizeImage(buffer)
      
      // Only use optimized if it's smaller or format changed
      if (result.optimizedSize < originalSize || result.format !== fileContentType?.split('/')[1]) {
        uploadBuffer = result.buffer
        uploadContentType = getMimeType(result.format)
        outputFormat = result.format
        compressionRatio = result.compressionRatio
        wasOptimized = true
        
        // Update filename extension if format changed
        if (result.format !== fileContentType?.split('/')[1]) {
          const ext = getExtension(result.format)
          const baseName = path.basename(filename, path.extname(filename))
          uploadFilename = baseName + ext
        }
        
        console.log(`[Image Optimization] ${formatBytes(originalSize)} → ${formatBytes(result.optimizedSize)} (${result.compressionRatio}% reduction, format: ${result.format})`)
      }
    } catch (error) {
      // If optimization fails, fall back to original
      console.warn('[Image Optimization] Failed, using original:', error)
    }
  }

  // Use Vercel Blob in production if token is available
  if (isBlobStorageAvailable()) {
    try {
      // Vercel Blob only supports 'public' access
      const blob = await put(uploadFilename, uploadBuffer, {
        access: 'public',
        addRandomSuffix,
        contentType: uploadContentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: uploadBuffer.length,
        uploadedAt: new Date(),
        originalSize,
        optimizedSize: uploadBuffer.length,
        compressionRatio,
        format: outputFormat,
        wasOptimized,
      }
    } catch (error) {
      // If blob storage is required, don't fall back to local storage
      if (requireBlobStorage) {
        throw new Error(`Vercel Blob upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      console.error('Vercel Blob upload failed, falling back to local storage:', error)
      // Fall through to local storage
    }
  }

  // Fallback to local file storage for development
  // Generate unique filename
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(uploadFilename) || (file instanceof File ? path.extname(file.name) : '.bin')
  const uniqueFilename = `${timestamp}-${randomStr}${ext}`

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  // Write file
  const filePath = path.join(uploadsDir, uniqueFilename)
  await writeFile(filePath, uploadBuffer)

  // Return URL relative to public folder
  const url = `/uploads/${uniqueFilename}`

  return {
    url,
    pathname: uniqueFilename,
    size: uploadBuffer.length,
    uploadedAt: new Date(),
    originalSize,
    optimizedSize: uploadBuffer.length,
    compressionRatio,
    format: outputFormat,
    wasOptimized,
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
