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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <NavigationClientWrapper />
      <div className="container mx-auto px-4 py-28 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">{product.subtitle}</p>
          <h1 className="text-4xl md:text-6xl font-black">{product.name}</h1>
          <p className="text-lg text-white/80 mx-5">{product.description}</p>
        </div>

        {/* Main Layout: Gallery Left + Info Right */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] max-w-7xl mx-auto">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
              <ProductGallery images={product.images} ratio={4 / 3} thumbnailSize="md" productName={product.name} />
            </div>

            {/* Color Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-2">Couleur</p>
              <p className="text-2xl font-semibold text-white">{product.color}</p>
            </div>
          </div>

          {/* Right: Price & Specs */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
              <div className="text-center pb-6 border-b border-white/10">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-3">Prix lancement</p>
                <p className="text-4xl font-bold text-white">{product.price}</p>
              </div>

              {/* Quick Specs */}
              <div className="space-y-4">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-2">{spec.label}</p>
                    <p className="text-base font-semibold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Client Component */}
              <ProductActions product={product} />
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">Caractéristiques Techniques</h2>
              <p className="text-white/60">Spécifications complètes du {product.name}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.specs.map((spec) => (
                <div 
                  key={spec.label} 
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.4em] text-amber-300 mb-2">{spec.label}</p>
                      <p className="text-lg font-semibold text-white leading-relaxed">{spec.value}</p>
                    </div>
                  </div>
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
