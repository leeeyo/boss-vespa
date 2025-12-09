'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useWishlist } from '@/lib/wishlist-context'
import { ProductCard } from '@/components/product-card'

export default function WishlistPage() {
  const { items, getWishlistCount } = useWishlist()
  const wishlistCount = getWishlistCount()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Mes Favoris</p>
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent px-2 py-1">
            Liste de Souhaits
          </h1>
          <p className="text-white/80 text-lg">
            {wishlistCount} article{wishlistCount !== 1 ? 's' : ''} sauvegardé{wishlistCount !== 1 ? 's' : ''}
          </p>
        </div>

        {items.length === 0 ? (
          // Empty State
          <div className="max-w-md mx-auto">
            <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <Heart className="w-16 h-16 text-white/20" />
                <h2 className="text-xl font-bold text-white">Votre liste est vide</h2>
                <p className="text-white/60">
                  Sauvegardez vos modèles préférés pour les retrouver facilement plus tard.
                </p>
                <Button 
                  asChild
                  className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400"
                >
                  <Link href="/collection">Explorer la collection</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Wishlist Grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

