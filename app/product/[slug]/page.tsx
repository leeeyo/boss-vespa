import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ProductGallery } from '@/components/product-gallery'
import { getVespaBySlug, vespaProducts } from '@/data/vespa'

type ProductPageProps = {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return vespaProducts.map((vespa) => ({ slug: vespa.slug }))
}

export default async function ProductPage({ params }: ProductPageProps) { const { slug } = await params
  const vespa = getVespaBySlug(slug)


  if (!vespa) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-28 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">{vespa.subtitle}</p>
          <h1 className="text-4xl md:text-6xl font-black">{vespa.name}</h1>
          <p className="text-lg text-white/80">{vespa.description}</p>
        </div>

        {/* Main Layout: Gallery Left + Info Right */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] max-w-7xl mx-auto">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
              <ProductGallery images={vespa.images} ratio={4 / 3} thumbnailSize="md" />
            </div>

            {/* Color Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-2">Couleur</p>
              <p className="text-2xl font-semibold text-white">{vespa.color}</p>
            </div>
          </div>

          {/* Right: Price & Specs */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
              <div className="text-center pb-6 border-b border-white/10">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70 mb-3">Prix lancement</p>
                <p className="text-4xl font-bold text-white">{vespa.price}</p>
              </div>

              {/* Quick Specs */}
              <div className="space-y-4">
                {vespa.specs.map((spec) => (
                  <div key={spec.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-2">{spec.label}</p>
                    <p className="text-base font-semibold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 pt-4">
                <Button className="w-full bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400 h-12">
                  Réserver un essai
                </Button>
                <Button asChild variant="outline" className="w-full border-white/40 bg-white/5 text-white hover:bg-white/10 h-12">
                  <Link href="tel:+21650000000">Appeler le showroom</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">Caractéristiques Techniques</h2>
              <p className="text-white/60">Spécifications complètes du {vespa.name}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vespa.specs.map((spec) => (
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

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 mt-4">
              <p className="text-sm text-white/80 leading-relaxed">
                <span className="font-semibold text-amber-300">Note:</span> Toutes les spécifications sont fournies par le fabricant et peuvent varier selon les conditions d&apos;utilisation. 
                Contactez notre showroom pour plus de détails techniques.
              </p>
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
    </div>
  )
}

