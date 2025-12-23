'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ProductGallery } from '@/components/product-gallery'
import { VespaProduct } from '@/data/vespa'
import { IProduct } from '@/models/Product'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [vespa, setVespa] = useState<VespaProduct | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/slug/${slug}`)
        if (!response.ok) {
          setVespa(null)
          return
        }
        const data = (await response.json()) as IProduct
        // Transform API response to VespaProduct format
        const formattedPrice = new Intl.NumberFormat('fr-FR', {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(data.price) + ' TND'
        
        // Store the backend product ID for order creation
        setProductId(data._id.toString())
        
        setVespa({
          slug: data.slug,
          name: data.name,
          subtitle: data.subtitle || '',
          category: data.category,
          color: data.color || '',
          description: data.description || '',
          price: formattedPrice,
          specs: data.technicalInfo || [],
          images: data.images || [],
        })
      } catch (error) {
        console.error('Error fetching product:', error)
        setVespa(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
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

  const isWishlisted = isInWishlist(vespa.slug)

  const handleToggleWishlist = () => {
    toggleWishlist(vespa)
  }

  const handleAddToCart = () => {
    addItem(vespa, productId || undefined)
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
          <p className="text-lg text-white/80 mx-5">{vespa.description}</p>
        </div>

        {/* Main Layout: Gallery Left + Info Right */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] max-w-7xl mx-auto">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_30px_60px_rgba(0,0,0,0.55)]">
              <ProductGallery images={vespa.images} ratio={4 / 3} thumbnailSize="md" productName={vespa.name} />
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
