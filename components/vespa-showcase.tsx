import { getAllProducts } from '@/lib/products'
import { ShowcaseTabs } from './showcase-tabs'

export async function VespaShowcase() {
  const allProducts = await getAllProducts()
  
  // Get 6 products from different categories/types
  const scooters = allProducts.filter(p => p.category === 'scooter').slice(0, 4)
  const accessories = allProducts.filter(p => p.category === 'accessory').slice(0, 2)
  const showcaseProducts = [...scooters, ...accessories].slice(0, 6)

  return (
    <section id="vespas" className="py-20 px-4 bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4 overflow-visible">
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent overflow-visible whitespace-normal wrap-break-word px-2 py-1">
            Explorez notre collection
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Découvrez une sélection de modèles prêts à exposer, et imaginez votre propre création grâce à notre atelier.
          </p>
        </div>

        <ShowcaseTabs products={showcaseProducts} />
      </div>
    </section>
  )
}
