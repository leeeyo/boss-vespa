'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { Menu, X, ShoppingCart, Heart, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useSession } from '@/hooks/use-session'

const navItems = [
  { id: 'home', fr: 'Accueil', en: 'Home', href: '/' },
  { id: 'shop', fr: 'Boutique', en: 'Shop', href: '/collection' },
  { id: 'custom', fr: 'Personnalisation', en: 'Customization', href: '/personalization' },
  { id: 'blog', fr: 'Blog', en: 'Blog', href: '/blog' },
  { id: 'contact', fr: 'Contact', en: 'Contact', href: '/contact' },
]

function TopBanner() {
  return (
    <div className="bg-amber-400 text-black py-2 px-4 text-center text-xs font-bold tracking-widest uppercase relative z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="hidden md:flex gap-4">
           <span>+216 97 310 394</span>
           <span>•</span>
           <span>contact@boss-vespa.tn</span>
        </div>
        <div className="flex justify-center gap-6">
          <Link href="/about" className="hover:underline">
            À propos
          </Link>
          <Link href="/livraison" className="hover:underline">
            Livraison 
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useState<'fr' | 'en'>('fr')
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const { getWishlistCount } = useWishlist()
  const wishlistCount = getWishlistCount()
  const sessionResult = useSession()
  // Defensive destructuring in case hook returns undefined during initial render
  const session = sessionResult?.data ?? null
  const status = sessionResult?.status ?? 'loading'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
      <TopBanner />
      <div className="h-px bg-black/20 w-full relative z-50"></div>
      <nav className="border-b border-white/10 bg-linear-to-r from-slate-950 via-slate-900 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image src="/logo.png" alt="Boss Vespa" width={48} height={48} className="rounded-full hover:scale-120 transition-all duration-300" />
            </Link>
            <div>
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

            {status === 'authenticated' && session ? (
              <div className="relative ml-4 group">
                <button 
                  className="rounded-full border border-amber-400/50 p-2 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-all flex items-center justify-center"
                  aria-label="Profil"
                >
                  <User size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Bienvenue</p>
                    <p className="text-sm font-bold text-white truncate">{session.user?.name || session.user?.email}</p>
                  </div>
                  {session.user?.role === 'admin' && (
                    <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors">
                      Tableau de bord
                    </Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 text-sm text-white/70 hover:text-amber-400 hover:bg-white/5 transition-colors">
                    Mon Profil
                  </Link>
                  <form action="/api/auth/signout" method="POST">
                    <button 
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-4 rounded-full border border-white/30 p-2 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center"
                aria-label="Connexion"
              >
                <User size={20} />
              </Link>
            )}
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
    </header>
  )
}

