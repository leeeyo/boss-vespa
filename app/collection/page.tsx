import { Suspense } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { CollectionFilters } from '@/components/collection-filters'
import { CollectionGrid } from '@/components/collection-grid'
import {
  getAllColors,
  getAllEngines,
  getAllFeatures,
  getPriceRange,
  filterVespas,
  type FilterOptions,
} from '@/data/vespa'

type SearchParams = {
  search?: string
  colors?: string
  engines?: string
  features?: string
  minPrice?: string
  maxPrice?: string
}

type CollectionPageProps = {
  searchParams: Promise<SearchParams>
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  // Await searchParams
  const params = await searchParams
  
  // Extract filter options from URL params
  const filters: FilterOptions = {
    search: params.search,
    colors: params.colors?.split(',').filter(Boolean),
    engines: params.engines?.split(',').filter(Boolean),
    features: params.features?.split(',').filter(Boolean),
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  }

  // Get filtered products
  const filteredProducts = filterVespas(filters)

  // Get filter metadata
  const colors = getAllColors()
  const engines = getAllEngines()
  const features = getAllFeatures()
  const priceRange = getPriceRange()

  // Check if any filters are applied
  const isFiltered = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300 mb-4">Collection</p>
          <h1 className="text-4xl md:text-6xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent mb-4">
            Toutes nos Vespas
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Explorez notre collection complète de Vespas. Utilisez les filtres pour trouver le modèle parfait qui
            correspond à vos besoins.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Filters */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <Suspense fallback={<FiltersSkeleton />}>
                <CollectionFilters
                  colors={colors}
                  engines={engines}
                  features={features}
                  priceRange={priceRange}
                />
              </Suspense>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <Suspense fallback={<GridSkeleton />}>
              <CollectionGrid products={filteredProducts} isFiltered={isFiltered} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Loading skeletons
function FiltersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded" />
      <div className="h-10 bg-white/10 rounded" />
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white/5 rounded-2xl h-96" />
        </div>
      ))}
    </div>
  )
}

