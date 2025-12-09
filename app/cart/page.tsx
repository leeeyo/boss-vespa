'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getItemCount, getCartTotal } = useCart()
  const itemCount = getItemCount()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Mon Panier</p>
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent px-2 py-1">
            Votre Panier
          </h1>
          <p className="text-white/80 text-lg">
            {itemCount} article{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        {items.length === 0 ? (
          // Empty State
          <div className="max-w-md mx-auto">
            <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <ShoppingCart className="w-16 h-16 text-white/20" />
                <h2 className="text-xl font-bold text-white">Votre panier est vide</h2>
                <p className="text-white/60">
                  Découvrez notre collection de Vespas et trouvez celle qui vous correspond.
                </p>
                <Button 
                  asChild
                  className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400"
                >
                  <Link href="/collection">Découvrir nos Vespas</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Cart Items Grid
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {items.map((item) => (
                <Card 
                  key={item.slug} 
                  className="border border-white/10 bg-white/5 backdrop-blur overflow-hidden transition-all hover:bg-white/10"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      {/* Image */}
                      <div className="relative w-full sm:w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-white/5">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 128px"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-white">{item.name}</h3>
                            <p className="text-amber-300/90 text-sm">{item.subtitle}</p>
                          </div>
                          <p className="text-white/70 font-medium">{item.price}</p>
                        </div>
                        
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white/60">Quantité</span>
                            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 text-white">
                              <button
                                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                aria-label="Diminuer la quantité"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                aria-label="Augmenter la quantité"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.slug)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-400/10 rounded-full"
                            aria-label="Retirer du panier"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <Card className="border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-bold text-white">Résumé</h3>
                    
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between text-white/80">
                        <span>Sous-total</span>
                        <span className="font-semibold text-white">{getCartTotal()}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Livraison</span>
                        <span>Calculée à la commande</span>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg text-white">Total</span>
                      <span className="font-black text-2xl bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        {getCartTotal()}
                      </span>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400 py-6 text-lg transition-transform hover:scale-[1.02]"
                    >
                      <Link href="/checkout">Commander</Link>
                    </Button>
                    
                    <Button 
                      onClick={clearCart}
                      variant="outline"
                      className="w-full border-white/20 bg-transparent hover:bg-white/10 text-white hover:text-white"
                    >
                      Vider le panier
                    </Button>
                  </CardContent>
                </Card>
                
                <p className="text-xs text-center text-white/40">
                  En procédant au paiement, vous acceptez nos conditions générales de vente.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

