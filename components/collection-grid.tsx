'use client'

import { VespaProduct } from '@/data/vespa'
import { ProductCard } from '@/components/product-card'
import { PackageX } from 'lucide-react'

type CollectionGridProps = {
  products: VespaProduct[]
  isFiltered: boolean
}

export function CollectionGrid({ products, isFiltered }: CollectionGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-white/5 p-6 mb-6">
          <PackageX className="w-16 h-16 text-white/30" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Aucun résultat trouvé</h3>
        <p className="text-white/60 max-w-md">
          {isFiltered
            ? 'Essayez de modifier vos critères de recherche ou supprimez certains filtres.'
            : 'Aucune Vespa disponible pour le moment.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-white/80">
          <span className="font-bold text-amber-400 text-lg">{products.length}</span>{' '}
          {products.length === 1 ? 'Vespa trouvée' : 'Vespas trouvées'}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  )
}

