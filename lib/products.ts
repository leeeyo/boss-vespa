import connectDB from './mongodb'
import Product, { IProduct } from '@/models/Product'
import { VespaProduct } from '@/data/vespa'

export type FilterOptions = {
  search?: string
  category?: 'scooter' | 'accessory' | 'all'
  colors?: string[]
  engines?: string[]
  features?: string[]
  minPrice?: number
  maxPrice?: number
}

/**
 * Transform database product model to component interface
 */
export function transformProductToVespaProduct(product: IProduct | Record<string, unknown>): VespaProduct {
  const productObj = product as IProduct
  // Format price as string (e.g., "16 900 TND")
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(productObj.price)) + ' TND'

  // Clean technicalInfo array to remove _id fields from nested objects
  // This ensures only plain objects are passed to Client Components
  const cleanSpecs = (productObj.technicalInfo || []).map((spec: { label?: string; value?: string; _id?: unknown }) => {
    // Create a plain object with only the fields we need
    const cleanSpec: { label: string; value: string } = {
      label: String(spec.label || ''),
      value: String(spec.value || ''),
    }
    return cleanSpec
  })

  return {
    slug: productObj.slug,
    name: productObj.name,
    subtitle: productObj.subtitle || '',
    category: productObj.category,
    color: productObj.color || '',
    description: productObj.description || '',
    price: formattedPrice,
    specs: cleanSpecs,
    images: productObj.images || [],
  }
}

/**
 * Fetch all active products from database
 */
export async function getAllProducts(): Promise<VespaProduct[]> {
  await connectDB()
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean()
  console.log(`[DB] Fetched ${products.length} products from database`)
  return products.map(transformProductToVespaProduct)
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<VespaProduct | null> {
  await connectDB()
  const product = await Product.findOne({ slug, isActive: true }).lean()
  if (!product) return null
  return transformProductToVespaProduct(product as IProduct)
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(limit: number = 2): Promise<VespaProduct[]> {
  await connectDB()
  const products = await Product.find({ 
    isFeaturing: true, 
    isActive: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
  return products.map(transformProductToVespaProduct)
}

/**
 * Get filter metadata (colors, engines, features, price range)
 */
export async function getFilterMetadata() {
  await connectDB()
  const products = await Product.find({ isActive: true }).lean()

  // Extract unique colors
  const colors = Array.from(
    new Set(products.map((p) => p.color).filter(Boolean) as string[])
  ).sort()

  // Extract unique engine types from technicalInfo
  const engines = Array.from(
    new Set(
      products
        .map((p) => {
          const engineSpec = p.technicalInfo?.find((s) => s.label === 'Moteur')
          return engineSpec?.value
        })
        .filter(Boolean) as string[]
    )
  ).sort()

  // Extract unique features from technicalInfo (Extras field)
  const features = Array.from(
    new Set(
      products
        .flatMap((p) => {
          const extrasSpec = p.technicalInfo?.find((s) => s.label === 'Extras')
          if (!extrasSpec) return []
          return extrasSpec.value.split(',').map((f) => f.trim())
        })
        .filter(Boolean)
    )
  ).sort()

  // Get price range
  const prices = products.map((p) => p.price).filter((p) => p > 0)
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
  }

  return {
    colors,
    engines,
    features,
    priceRange,
  }
}

/**
 * Filter products based on filter options
 */
export async function filterProducts(filters: FilterOptions): Promise<VespaProduct[]> {
  await connectDB()
  console.log('[DB] Filtering products with filters:', filters)

  // Build MongoDB query
  const query: Record<string, unknown> = {
    isActive: true,
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category
  }

  // Color filter
  if (filters.colors && filters.colors.length > 0) {
    query.color = { $in: filters.colors }
  }

  // Engine power filter (extract from technicalInfo)
  if (filters.engines && filters.engines.length > 0) {
    // We need to match products where technicalInfo contains matching engine values
    // This is complex, so we'll filter in memory after fetching
    // For now, we'll fetch all and filter
  }

  // Price filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {}
    if (filters.minPrice !== undefined) {
      query.price = { ...query.price, $gte: filters.minPrice }
    }
    if (filters.maxPrice !== undefined) {
      query.price = { ...query.price, $lte: filters.maxPrice }
    }
  }

  // Search filter
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { subtitle: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ]
  }

  let products = await Product.find(query).sort({ createdAt: -1 }).lean()
  console.log(`[DB] Found ${products.length} products matching query`)

  // Filter by engine and features in memory (complex queries)
  if (filters.engines && filters.engines.length > 0) {
    products = products.filter((p) => {
      const engineSpec = p.technicalInfo?.find((s: { label: string; value: string }) => s.label === 'Moteur')
      return engineSpec && filters.engines?.includes(engineSpec.value)
    })
  }

  if (filters.features && filters.features.length > 0) {
    products = products.filter((p) => {
      const extrasSpec = p.technicalInfo?.find((s: { label: string; value: string }) => s.label === 'Extras')
      if (!extrasSpec) return false
      const productFeatures = extrasSpec.value.split(',').map((f: string) => f.trim())
      return filters.features?.every((feature) =>
        productFeatures.some((pf: string) => pf.includes(feature) || feature.includes(pf))
      )
    })
  }

  return products.map((p) => transformProductToVespaProduct(p as IProduct))
}

