'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { VespaProduct } from '@/data/vespa'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useToast } from '@/hooks/use-toast'

type ProductCardProps = {
  product: VespaProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  
  const isWishlisted = isInWishlist(product.slug)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} a été ajouté à votre panier.`,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:scale-[1.02] hover:border-amber-400/30">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
          <Image
            src={product.images[0] as string}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 text-white transition-all hover:scale-110 active:scale-95"
          aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart 
            size={20} 
            className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-white"} 
          />
        </button>

        {/* Quick Add Button (Bottom Right Overlay) */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 z-10 p-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 text-black shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 hover:shadow-amber-400/50"
          aria-label="Ajouter au panier"
        >
          <ShoppingBag size={20} />
        </button>
        
        {/* Floating Price Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur border border-white/10 text-white px-3 py-1.5 rounded-full font-bold text-sm">
          {product.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">
            {product.subtitle}
          </p>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-amber-300/90 text-sm font-medium">
          {product.color}
        </p>

        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          {product.specs.slice(0, 2).map((spec) => (
            <div key={spec.label} className="space-y-0.5">
              <p className="text-white/40 uppercase tracking-wider">{spec.label}</p>
              <p className="text-white/80 font-semibold">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            asChild
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
          >
            <Link href={`/product/${product.slug}`}>
              Voir les détails
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
