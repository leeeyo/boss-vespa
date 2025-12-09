'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ProductGallery } from '@/components/product-gallery'
import { getVespaBySlug, vespaProducts } from '@/data/vespa'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/hooks/use-toast'

type ProductPageProps = {
  params: {
    slug: string
  }
}

// Since we're using 'use client', we can't export generateStaticParams directly in the same way 
// if we want to keep it simple, but for Next.js App Router with 'use client', 
// we typically separate the client component or use a wrapper.
// However, 'use client' components can't be async page components receiving params directly in the same way in older versions,
// but in Next.js 13/14, client components can be pages.
// BUT `generateStaticParams` only works in Server Components.
// So the plan says "Convert to client component with 'use client' directive". 
// This implies the page itself becomes a client component. 
// This breaks `generateStaticParams`.
// To follow the plan strictly but keep it working, I should probably keep the page as Server Component 
// and make a client component wrapper for the interactive parts, OR simpler:
// The plan says "Convert to client component". I will follow the plan. 
// If `generateStaticParams` is an issue, I will remove it or comment it out if it causes build errors, 
// but usually it's ignored in client pages or handled differently.
// Wait, `generateStaticParams` MUST be in a Server Component.
// The user said "Follow the below plan verbatim".
// "Convert to client component with 'use client' directive".
// I will adhere to this. If it breaks SSG, so be it, as I must follow the plan.
// However, a better approach that usually works in these instructions is that 
// the user might not realize the conflict. 
// I'll assume the user wants the INTERACTIVITY.
// I'll make the page a Client Component. 
// I'll comment out `generateStaticParams` to avoid build errors if necessary, 
// OR I'll assume the user might have meant the inner content.
// But "File: app/product/[slug]/page.tsx" implies editing THIS file.
// I'll implement it as a client component.
// I'll need to use `use` to unwrap params if it was server component, but here `params` is prop.
// Actually, in Next.js 15 (which the user might be on, or 14), `params` is a promise.
// In the existing code: `export default async function ProductPage({ params }: ProductPageProps) { const { slug } = await params`
// If I make it 'use client', it can't be async.
// So I will convert it to a standard component and use `useParams` if needed or just props.
// But wait, the existing code handles params as a Promise.
// I will try to keep it simple.

// Checking the plan: "Convert to client component with 'use client' directive".
// I will do that. I'll rely on `React.use()` or `useEffect` to unwrap params if needed, 
// or simpler, just use the prop if passed (Next.js passes params to pages).
// Note: In Next.js 13+, pages are Server Components by default.
// If I add 'use client', it becomes a Client Component.
// It receives `params`.
// I'll implement the logic.

import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'

export default function ProductPage({ params }: any) {
  const { slug } = require('next/navigation').useParams() 
  const vespa = getVespaBySlug(slug as string)
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  // Hooks must be called unconditionally at top level
  // So we handle the 'vespa not found' return LATER

  const isWishlisted = vespa ? isInWishlist(vespa.slug) : false

  const handleToggleWishlist = () => {
    if (vespa) toggleWishlist(vespa)
  }

  if (!vespa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button asChild>
            <Link href="/collection">Retour à la collection</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(vespa)
    toast({
      title: 'Produit ajouté au panier',
      description: `${vespa.name} a été ajouté à votre panier.`,
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />
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
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400 h-12"
                >
                  Ajouter au panier
                </Button>
                
                <div className="grid grid-cols-5 gap-4">
                  <Button 
                    onClick={handleToggleWishlist}
                    variant="outline" 
                    className={`col-span-1 h-12 border-white/40 bg-white/5 hover:bg-white/10 flex items-center justify-center ${
                      isWishlisted ? 'text-rose-500 border-rose-500/50 hover:bg-rose-500/10' : 'text-white'
                    }`}
                  >
                    <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                  </Button>
                  
                  <Button asChild variant="outline" className="col-span-4 border-white/40 bg-white/5 text-white hover:bg-white/10 h-12">
                    <Link href="tel:+21650000000">Appeler le showroom</Link>
                  </Button>
                </div>
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
      <Footer />
    </div>
  )
}
