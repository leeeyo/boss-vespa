import { vespaProducts, VespaProduct } from '@/data/vespa'

// Color name to hex mapping for Vespa products
const COLOR_MAP: Record<string, string> = {
  'vert jungle': '#3d7c4a',
  'blanc perlé': '#f5f5f0',
  'blanc': '#f5f5f0',
  'rouge': '#c41e3a',
  'bleu': '#1e90ff',
  'jaune': '#ffd700',
  'noir': '#1a1a1a',
  'gris': '#898989',
  'orange': '#ff6b35',
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate color distance using Euclidean distance
 */
function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  if (!rgb1 || !rgb2) return Infinity

  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2)
  )
}

/**
 * Extract hex color from product color name
 */
function getHexFromColorName(colorName: string): string | null {
  const lowerColor = colorName.toLowerCase()

  // Direct lookup
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (lowerColor.includes(name)) {
      return hex
    }
  }

  return null
}

/**
 * Find matching Vespa product based on selected color
 * Returns the product with the closest color match
 */
export function findMatchingProduct(selectedColorHex: string): {
  product: VespaProduct | null
  similarity: number
} {
  let bestMatch: VespaProduct | null = null
  let minDistance = Infinity

  for (const product of vespaProducts) {
    const productHex = getHexFromColorName(product.color)
    
    if (productHex) {
      const distance = colorDistance(selectedColorHex, productHex)
      
      // Consider it a match if very close (threshold of 50 for RGB distance)
      if (distance < minDistance) {
        minDistance = distance
        bestMatch = product
      }
    }
  }

  // Calculate similarity percentage (inverse of distance, normalized)
  const similarity = minDistance < Infinity ? Math.max(0, 100 - (minDistance / 4.4)) : 0

  // Only return match if similarity is above 70%
  return {
    product: similarity > 70 ? bestMatch : null,
    similarity: Math.round(similarity),
  }
}

/**
 * Get collection URL with color filter
 */
export function getCollectionUrlWithColor(colorName: string): string {
  return `/collection?colors=${encodeURIComponent(colorName)}`
}

