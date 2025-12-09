'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { Menu, X, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'

const navItems = [
  { id: 'home', fr: 'Accueil', en: 'Home', href: '/' },
  { id: 'vespas', fr: 'Nos Vespas', en: 'Our Vespas', href: '/collection' },
  { id: 'custom', fr: 'Personnalisation', en: 'Customization', href: '/personalization' },
  { id: 'delivery', fr: 'Livraison', en: 'Delivery', href: '/livraison' },
  { id: 'contact', fr: 'Contact', en: 'Contact', href: '/contact' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useState<'fr' | 'en'>('fr')
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const { getWishlistCount } = useWishlist()
  const wishlistCount = getWishlistCount()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-linear-to-r from-slate-950 via-slate-900 to-gray-900 text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Boss Vespa" width={48} height={48} className="rounded-full" />
            <div>
              <p className="text-lg font-black tracking-wide">Boss Vespa</p>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Mahdia · Tunisia</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const text = lang === 'fr' ? item.fr : item.en
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors"
                >
                  {text}
                </Link>
              )
            })}
            <Link
              href="/wishlist"
              className="ml-4 rounded-full border border-white/30 p-2 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center relative"
              aria-label="Liste de souhaits"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-linear-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="ml-4 rounded-full border border-white/30 p-2 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center relative"
              aria-label="Panier"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-linear-to-r from-amber-400 to-orange-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden rounded-full border border-white/30 p-2 text-white bg-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Ouvrir le menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/20 space-y-2">
            {navItems.map((item) => {
              const text = lang === 'fr' ? item.fr : item.en
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block py-2 text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {text}
                </Link>
              )
            })}
            <Link
              href="/wishlist"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/30 p-3 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all relative"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-linear-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold">Favoris</span>
            </Link>

            <Link
              href="/cart"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/30 p-3 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all relative"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-linear-to-r from-amber-400 to-orange-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold">Panier</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

