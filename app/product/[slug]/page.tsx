import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductGallery } from '@/components/product-gallery'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'
import { getProductBySlug } from '@/lib/products'
import { ProductActions } from './product-actions'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white overflow-x-hidden">
      <NavigationClientWrapper />
      <div className="w-full lg:mt-10 max-w-7xl mx-auto px-3 sm:px-4 pt-header pb-12 md:pb-16 space-y-6 md:space-y-12 overflow-x-hidden">
        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4 pt-4 md:pt-0">
          <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-amber-300">{product.subtitle}</p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black">{product.name}</h1>
          <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto px-2">{product.description}</p>
        </div>

        {/* Main Layout: Gallery Left + Info Right */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.5fr_1fr] min-w-0">
          {/* Left: Gallery */}
          <div className="space-y-4 md:space-y-6 min-w-0">
            <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-2 sm:p-3 md:p-6 lg:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
              <ProductGallery images={product.images} videos={product.videos} ratio={4 / 3} thumbnailSize="sm" productName={product.name} />
            </div>

            {/* Color Card */}
            <div className="rounded-xl md:rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 md:p-6">
              <p className="text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/60 mb-1 md:mb-2">Couleur</p>
              <p className="text-lg md:text-2xl font-semibold text-white">{product.color}</p>
            </div>
          </div>

          {/* Right: Price & Specs */}
          <div className="space-y-4 md:space-y-6 min-w-0">
            {/* Price Card */}
            <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-3 sm:p-4 md:p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4 md:space-y-6">
              <div className="text-center pb-4 md:pb-6 border-b border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/70 mb-2 md:mb-3">Prix lancement</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{product.price}</p>
              </div>

              {/* Quick Specs */}
              <div className="space-y-3 md:space-y-4">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="rounded-xl md:rounded-2xl border border-white/10 bg-white/5 p-3 md:p-5">
                    <p className="text-xs uppercase tracking-[0.15em] md:tracking-[0.35em] text-white/50 mb-1 md:mb-2">{spec.label}</p>
                    <p className="text-sm md:text-base font-semibold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Client Component */}
              <ProductActions product={product} />
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="min-w-0">
          <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-3 sm:p-4 md:p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-4 md:space-y-6">
            <div className="text-center space-y-1 md:space-y-2">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold">Caractéristiques</h2>
              <p className="text-xs md:text-base text-white/60">Spécifications du {product.name}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {product.specs.map((spec) => (
                <div 
                  key={spec.label} 
                  className="rounded-xl md:rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-2 md:p-4 lg:p-6 hover:bg-white/10 transition-colors min-w-0"
                >
                  <p className="text-[9px] md:text-xs uppercase tracking-wider md:tracking-[0.3em] text-amber-300 mb-1 md:mb-2 truncate">{spec.label}</p>
                  <p className="text-xs md:text-base lg:text-lg font-semibold text-white leading-snug md:leading-relaxed">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-8">
          <Link href="/" className="inline-block text-sm uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
