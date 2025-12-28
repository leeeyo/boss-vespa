import { Suspense} from 'react'
import { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { CollectionFilters } from '@/components/collection-filters'
import { CollectionGrid } from '@/components/collection-grid'
import { Breadcrumb } from '@/components/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { generateMetadata as genMeta } from '@/lib/seo'

import {
  getFilterMetadata,
  filterProducts,
  type FilterOptions,
} from '@/lib/products'

export const metadata: Metadata = genMeta({
  title: 'Boutique',
  description: 'Découvrez notre collection complète de Vespas et accessoires. Scooters et pièces détachées disponibles avec livraison en Tunisie.',
  path: '/collection',
  image: '/images/showcase1.jpg',
})

type SearchParams = {
  search?: string
  category?: 'scooter' | 'accessory' | 'all'
  type?: string
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
    category: params.category,
    type: params.type,
    colors: params.colors?.split(',').filter(Boolean),
    engines: params.engines?.split(',').filter(Boolean),
    features: params.features?.split(',').filter(Boolean),
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  }

  // Get filtered products and filter metadata
  let filteredProducts: Awaited<ReturnType<typeof filterProducts>> = []
  let filterMetadata: Awaited<ReturnType<typeof getFilterMetadata>> = {
    colors: [],
    engines: [],
    features: [],
    priceRange: { min: 0, max: 0 },
  }

  try {
    const results = await Promise.all([
      filterProducts(filters),
      getFilterMetadata(),
    ])
    filteredProducts = results[0]
    filterMetadata = results[1]
  } catch (error) {
    console.error('Error fetching products:', error)
    // Fallback to empty arrays on error
  }

  const { colors, engines, features, priceRange } = filterMetadata

  // Check if any filters are applied
  const isFiltered = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-24">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Boutique', url: '/collection' },
            ...(params.type ? [{ name: params.type }] : []),
          ]}
        />

        {/* Header */}
        <div className="mb-12 text-center py-5">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300 mb-4">Boutique</p>
          <h1 className="text-4xl md:text-6xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent mb-4 py-2">
            {params.type ? `Vespa ${params.type}` : 'Catalogue Boss Vespa'}
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Découvrez nos scooters exclusifs et une large gamme d&apos;accessoires pour personnaliser votre expérience.
          </p>
        </div>

        {/* Active Filters */}
        {params.type && (
          <div className="mb-6 flex items-center gap-2 justify-center">
            <Badge variant="outline" className="border-amber-400/50 text-amber-400 bg-amber-400/10 px-4 py-2">
              Modèle: {params.type}
              <Link 
                href="/collection"
                className="ml-2 hover:text-amber-300 transition-colors"
                aria-label={`Supprimer le filtre ${params.type}`}
              >
                <X className="w-4 h-4 inline" />
              </Link>
            </Badge>
          </div>
        )}

         {/* Mobile Filters Button */}
         <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-max">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full shadow-2xl bg-amber-400 text-black hover:bg-amber-300 font-bold px-8">
                  <Filter className="mr-2 h-4 w-4" /> Filtres
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] bg-slate-950 border-t border-white/10 text-white p-0 flex flex-col rounded-t-3xl">
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-white">Filtres</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <Suspense fallback={<FiltersSkeleton />}>
                      <CollectionFilters
                        colors={colors}
                        engines={engines}
                        features={features}
                        priceRange={priceRange}
                      />
                    </Suspense>
                </div>
              </SheetContent>
            </Sheet>
         </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:sticky lg:top-24 h-fit">
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

