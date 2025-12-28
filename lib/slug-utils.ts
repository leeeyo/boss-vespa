/**
 * Slug generation utilities
 */

import Product from '@/models/Product'
import mongoose from 'mongoose'

/**
 * Generate a base slug from a name
 */
export function generateBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Generate a unique slug by checking the database
 * If the slug exists, appends a number suffix (e.g., product-name-2, product-name-3)
 */
export async function generateUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  // Check if slug exists
  while (true) {
    const query: any = { slug }
    if (excludeId) {
      // Convert string ID to ObjectId if needed
      const objectId = mongoose.Types.ObjectId.isValid(excludeId) 
        ? new mongoose.Types.ObjectId(excludeId)
        : excludeId
      query._id = { $ne: objectId }
    }

    const existing = await Product.findOne(query)
    
    if (!existing) {
      // Slug is available
      return slug
    }

    // Slug exists, try with a number suffix
    counter++
    slug = `${baseSlug}-${counter}`
  }
}

