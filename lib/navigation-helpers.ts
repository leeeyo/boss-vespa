import { VespaProduct } from '@/data/vespa'

/**
 * Group scooter products by type field
 */
export function groupProductsByType(products: VespaProduct[]): { modelType: string; products: VespaProduct[]; count: number }[] {
  const groupedByType = new Map<string, VespaProduct[]>()
  
  products.forEach((product) => {
    // Extract type from product name or use a default
    // This is a fallback if type field is not available
    const type = extractTypeFromProduct(product)
    if (type) {
      if (!groupedByType.has(type)) {
        groupedByType.set(type, [])
      }
      groupedByType.get(type)!.push(product)
    }
  })

  return Array.from(groupedByType.entries())
    .map(([modelType, products]) => ({
      modelType,
      products,
      count: products.length,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Extract model type from product name
 * Fallback helper if type field is not available
 */
function extractTypeFromProduct(product: VespaProduct): string | null {
  const name = product.name.toUpperCase()
  if (name.includes('GTS')) return 'GTS'
  if (name.includes('GTV')) return 'GTV'
  if (name.includes('PRIMAVERA')) return 'PRIMAVERA'
  if (name.includes('SPRINT')) return 'SPRINT'
  if (name.includes('946')) return '946 SNAKE'
  return null
}

/**
 * Format blog date as "il y a X jours"
 */
export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Il y a 1 jour"
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? "Il y a 1 semaine" : `Il y a ${weeks} semaines`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`
  }
  const years = Math.floor(diffDays / 365)
  return years === 1 ? "Il y a 1 an" : `Il y a ${years} ans`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

