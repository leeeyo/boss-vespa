'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { VespaProduct } from '@/data/vespa'

type ProductActionsProps = {
  product: VespaProduct
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  const isWishlisted = isInWishlist(product.slug)

  const handleToggleWishlist = () => {
    toggleWishlist(product)
  }

  const handleAddToCart = () => {
    addItem(product, product.productId)
    toast({
      title: 'Produit ajouté au panier',
      description: `${product.name} a été ajouté à votre panier.`,
    })
  }

  return (
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
          <a href="tel:+21650000000">Appeler le showroom</a>
        </Button>
      </div>
    </div>
  )
}

