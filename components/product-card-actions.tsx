'use client'

import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useToast } from '@/hooks/use-toast'
import { VespaProduct } from '@/data/vespa'

type ProductCardActionsProps = {
  product: VespaProduct
}

export function ProductCardActions({ product }: ProductCardActionsProps) {
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const inWishlist = isInWishlist(product.slug)

  const handleAddToCart = () => {
    addItem(product, product.productId)
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} a été ajouté à votre panier.`,
    })
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product)
    toast({
      title: inWishlist ? 'Retiré des favoris' : 'Ajouté aux favoris',
      description: inWishlist 
        ? `${product.name} a été retiré de vos favoris.`
        : `${product.name} a été ajouté à vos favoris.`,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="border-white/30 bg-white/5 text-white hover:bg-white/10 transition-colors duration-200"
        onClick={handleToggleWishlist}
        aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart 
          size={16} 
          className={inWishlist ? 'fill-rose-400 text-rose-400' : ''}
        />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-white/30 bg-white/5 text-white hover:bg-white/10 transition-colors duration-200"
        onClick={handleAddToCart}
        aria-label="Ajouter au panier"
      >
        <ShoppingCart size={16} />
      </Button>
      <Button 
        asChild 
        size="sm"
        className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400"
      >
        <Link href={`/product/${product.slug}`}>
          <Eye size={16} className="mr-1" />
          Détails
        </Link>
      </Button>
    </div>
  )
}

