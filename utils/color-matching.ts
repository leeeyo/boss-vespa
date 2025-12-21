import { VespaProduct } from '@/data/vespa'

// Vespa model types
export const VESPA_MODELS = ['GTS', 'GTV', 'Primavera', 'Sprint', 'Snake'] as const
export type VespaModel = typeof VESPA_MODELS[number]

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
  'vert': '#3d7c4a',
  'violet': '#581c87',
  'rose': '#fda4af',
  'bordeaux': '#7f1d1d',
  'beige': '#d4c4a8',
  'crème': '#fef3c7',
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
 * Extract hex color from product color name or return hex if already hex
 */
function getHexFromColorName(colorName: string): string | null {
  // If it's already a hex color, return it
  if (colorName.startsWith('#')) {
    return colorName
  }

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
 * Check if a product is a Vespa scooter
 */
function isVespaScooter(product: VespaProduct): boolean {
  return (
    product.category === 'scooter' &&
    product.name.toLowerCase().includes('vespa')
  )
}

/**
 * Check if product matches a specific Vespa model
 */
function matchesVespaModel(product: VespaProduct, model: VespaModel | null): boolean {
  if (!model) return true // No model filter, match all
  
  const productName = product.name.toLowerCase()
  const modelLower = model.toLowerCase()
  
  // Special handling for Snake
  if (model === 'Snake') {
    return productName.includes('Snake') || productName.includes('snake')
  }
  
  return productName.includes(modelLower)
}

/**
 * Find ALL matching Vespa products based on selected color and model
 * Returns array of products that match the color threshold
 */
export function findAllMatchingProducts(
  selectedColorHex: string,
  products: VespaProduct[] = [],
  selectedModel: VespaModel | null = null
): VespaProduct[] {
  const matches: VespaProduct[] = []
  const COLOR_THRESHOLD = 50 // Allow some color variation for matching

  for (const product of products) {
    // Filter: Only Vespa scooters
    if (!isVespaScooter(product)) continue
    
    // Filter: Match selected model if specified
    if (!matchesVespaModel(product, selectedModel)) continue
    
    // Get product color hex
    const productHex = getHexFromColorName(product.color)
    
    if (productHex) {
      const distance = colorDistance(selectedColorHex, productHex)
      
      // Match if within color threshold
      if (distance < COLOR_THRESHOLD) {
        matches.push(product)
      }
    }
  }

  return matches
}

/**
 * Find matching Vespa product based on selected color (legacy - returns single best match)
 * Returns the product if available (100% match)
 */
export function findMatchingProduct(
  selectedColorHex: string,
  products: VespaProduct[] = []
): {
  product: VespaProduct | null
  isAvailable: boolean
} {
  let bestMatch: VespaProduct | null = null
  let minDistance = Infinity

  for (const product of products) {
    // Only match Vespa scooters
    if (!isVespaScooter(product)) continue
    
    const productHex = getHexFromColorName(product.color)
    
    if (productHex) {
      const distance = colorDistance(selectedColorHex, productHex)
      
      // Strict match: very small distance (essentially identical)
      if (distance < 15 && distance < minDistance) {
        minDistance = distance
        bestMatch = product
      }
    }
  }

  // Only return match if strict threshold met
  const isAvailable = minDistance < 15

  return {
    product: isAvailable ? bestMatch : null,
    isAvailable,
  }
}

/**
 * Get all Vespa scooters from products list
 */
export function getVespaScooters(products: VespaProduct[]): VespaProduct[] {
  return products.filter(isVespaScooter)
}

/**
 * Get collection URL with color filter
 */
export function getCollectionUrlWithColor(colorName: string): string {
  return `/collection?colors=${encodeURIComponent(colorName)}`
}
