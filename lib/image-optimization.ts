/**
 * Image Optimization Utility
 * Server-side image processing using Sharp
 */

import sharp from 'sharp'

export interface OptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: {
    webp?: number
    avif?: number
    jpeg?: number
    png?: number
  }
  convertPngToWebp?: boolean
  stripMetadata?: boolean
}

export interface OptimizationResult {
  buffer: Buffer
  format: string
  originalSize: number
  optimizedSize: number
  width: number
  height: number
  compressionRatio: number
}

const DEFAULT_OPTIONS: Required<OptimizationOptions> = {
  maxWidth: 4096,
  maxHeight: 4096,
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85,
    png: 9, // Compression level for PNG (0-9)
  },
  convertPngToWebp: true,
  stripMetadata: true,
}

/**
 * Check if format is optimizable (not SVG or animated GIF)
 */
function isOptimizable(format: string): boolean {
  // SVG should not be processed
  if (format === 'svg') return false
  
  // Check for animated GIF (Sharp doesn't optimize animated GIFs well)
  if (format === 'gif') {
    // For now, skip GIF optimization entirely
    return false
  }
  
  return ['jpeg', 'jpg', 'png', 'webp', 'avif'].includes(format.toLowerCase())
}

/**
 * Main image optimization function
 * Detects format, applies compression, and optionally converts formats
 */
export async function optimizeImage(
  input: Buffer,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const originalSize = input.length
  
  // Get image metadata
  const metadata = await sharp(input).metadata()
  const format = metadata.format || 'unknown'
  const originalWidth = metadata.width || 0
  const originalHeight = metadata.height || 0
  
  // Check if we should optimize
  if (!isOptimizable(format)) {
    return {
      buffer: input,
      format,
      originalSize,
      optimizedSize: originalSize,
      width: originalWidth,
      height: originalHeight,
      compressionRatio: 0,
    }
  }
  
  // Start building the sharp pipeline
  let pipeline = sharp(input)
  
  // Strip metadata if requested (EXIF, etc.)
  if (opts.stripMetadata) {
    pipeline = pipeline.rotate() // Auto-rotate based on EXIF, then strip
  }
  
  // Resize if exceeds max dimensions (maintain aspect ratio)
  if (originalWidth > opts.maxWidth || originalHeight > opts.maxHeight) {
    pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }
  
  let outputBuffer: Buffer
  let outputFormat = format
  
  // Format-specific optimization
  switch (format.toLowerCase()) {
    case 'png': {
      // Compress PNG
      const pngBuffer = await pipeline
        .png({ compressionLevel: opts.quality.png || 9, palette: true })
        .toBuffer()
      
      // Optionally convert to WebP if it results in smaller file
      if (opts.convertPngToWebp) {
        const webpBuffer = await sharp(input)
          .resize(opts.maxWidth, opts.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: opts.quality.webp || 85 })
          .toBuffer()
        
        // Use WebP if at least 20% smaller
        if (webpBuffer.length < pngBuffer.length * 0.8) {
          outputBuffer = webpBuffer
          outputFormat = 'webp'
        } else {
          outputBuffer = pngBuffer
          outputFormat = 'png'
        }
      } else {
        outputBuffer = pngBuffer
      }
      break
    }
    
    case 'jpeg':
    case 'jpg': {
      outputBuffer = await pipeline
        .jpeg({
          quality: opts.quality.jpeg || 85,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer()
      outputFormat = 'jpeg'
      break
    }
    
    case 'webp': {
      outputBuffer = await pipeline
        .webp({
          quality: opts.quality.webp || 85,
        })
        .toBuffer()
      outputFormat = 'webp'
      break
    }
    
    case 'avif': {
      outputBuffer = await pipeline
        .avif({
          quality: opts.quality.avif || 80,
          effort: 4, // Balance between speed and compression
        })
        .toBuffer()
      outputFormat = 'avif'
      break
    }
    
    default: {
      // For unknown formats, return as-is
      outputBuffer = input
    }
  }
  
  // Get final dimensions
  const outputMetadata = await sharp(outputBuffer).metadata()
  
  const optimizedSize = outputBuffer.length
  const compressionRatio = originalSize > 0 
    ? Math.round((1 - optimizedSize / originalSize) * 100) 
    : 0
  
  return {
    buffer: outputBuffer,
    format: outputFormat,
    originalSize,
    optimizedSize,
    width: outputMetadata.width || originalWidth,
    height: outputMetadata.height || originalHeight,
    compressionRatio,
  }
}

/**
 * Get MIME type from format string
 */
export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  }
  return mimeTypes[format.toLowerCase()] || 'application/octet-stream'
}

/**
 * Get file extension from format
 */
export function getExtension(format: string): string {
  const extensions: Record<string, string> = {
    jpeg: '.jpg',
    jpg: '.jpg',
    png: '.png',
    webp: '.webp',
    avif: '.avif',
    gif: '.gif',
    svg: '.svg',
  }
  return extensions[format.toLowerCase()] || ''
}

/**
 * Check if a content type is an image
 */
export function isImageContentType(contentType: string): boolean {
  const imageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
  ]
  return imageTypes.includes(contentType)
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

