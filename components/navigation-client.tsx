'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingCart, Heart, User, ChevronDown } from 'lucide-react'

import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useSession } from '@/hooks/use-session'
import { formatBlogDate, truncateText } from '@/lib/navigation-helpers'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { VespaProduct } from '@/data/vespa'

const navItems = [
  { id: 'home', fr: 'Accueil', en: 'Home', href: '/' },
  { id: 'shop', fr: 'Boutique', en: 'Shop', href: '/collection', hasDropdown: true },
  { id: 'custom', fr: 'Personnalisation', en: 'Customization', href: '/personalization' },
  { id: 'blog', fr: 'Blog', en: 'Blog', href: '/blog', hasDropdown: true },
  { id: 'contact', fr: 'Contact', en: 'Contact', href: '/contact' },
]

type ScooterModel = {
  modelType: string
  products: VespaProduct[]
  count: number
}

type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  category: string
}

type NavigationClientProps = {
  scooterModels: ScooterModel[]
  recentBlogPosts: BlogPost[]
}

export function NavigationClient({ scooterModels, recentBlogPosts }: NavigationClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useState<'fr' | 'en'>('fr')
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const { getWishlistCount } = useWishlist()
  const wishlistCount = getWishlistCount()
  const sessionResult = useSession()
  const session = sessionResult?.data ?? null
  const status = sessionResult?.status ?? 'loading'

  return (
    <>
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const text = lang === 'fr' ? item.fr : item.en
          
          // Boutique dropdown
          if (item.id === 'shop' && item.hasDropdown) {
            return (
              <div key={item.id} className="relative group">
                <button className="text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors flex items-center gap-1">
                  {text}
                  <ChevronDown size={16} className="opacity-70" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.55)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Nos Modèles</h3>
                  </div>
                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {scooterModels.map((model) => (
                        <Link
                          key={model.modelType}
                          href={`/collection?type=${encodeURIComponent(model.modelType)}`}
                          rel="nofollow"
                          className="p-3 rounded-lg hover:bg-white/5 hover:text-amber-400 transition-colors duration-200 group/item"
                        >
                          <div className="font-semibold text-sm text-white group-hover/item:text-amber-400">{model.modelType}</div>
                          <div className="text-xs text-white/60 mt-1">{model.count} modèle{model.count > 1 ? 's' : ''}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <Link
                      href="/collection"
                      className="block text-center text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Voir toute la collection →
                    </Link>
                  </div>
                </div>
              </div>
            )
          }

          // Blog dropdown
          if (item.id === 'blog' && item.hasDropdown) {
            return (
              <div key={item.id} className="relative group">
                <button className="text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors flex items-center gap-1">
                  {text}
                  <ChevronDown size={16} className="opacity-70" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.55)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Articles Récents</h3>
                  </div>
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {recentBlogPosts.length > 0 ? (
                      <div className="space-y-2">
                        {recentBlogPosts.map((post) => (
                          <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">{post.title}</h4>
                                {post.category && (
                                  <Badge variant="outline" className="text-xs mb-1 border-white/20 text-white/70">
                                    {post.category}
                                  </Badge>
                                )}
                                <p className="text-xs text-white/50">{formatBlogDate(post.publishedAt)}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60 p-3">Aucun article disponible</p>
                    )}
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <Link
                      href="/blog"
                      className="block text-center text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Voir tous les articles →
                    </Link>
                  </div>
                </div>
              </div>
            )
          }

          // Regular link
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

      {isOpen && (
        <div className="fixed inset-x-0 top-[100px] bottom-0 z-50 bg-slate-950 md:hidden overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const text = lang === 'fr' ? item.fr : item.en
            
            // Mobile dropdown for Boutique
            if (item.id === 'shop' && item.hasDropdown) {
              return (
                <Collapsible key={item.id} className="w-full">
                  <CollapsibleTrigger className="w-full flex items-center justify-between py-3 text-base font-semibold text-white/90 hover:text-amber-300 transition-colors min-h-[44px]">
                    <span>{text}</span>
                    <ChevronDown size={18} className="opacity-70" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1 mt-2">
                    {scooterModels.map((model) => (
                      <Link
                        key={model.modelType}
                        href={`/collection?type=${encodeURIComponent(model.modelType)}`}
                        rel="nofollow"
                        className="block py-3 text-base text-white/70 hover:text-amber-300 transition-colors min-h-[44px]"
                        onClick={() => setIsOpen(false)}
                      >
                        {model.modelType} ({model.count})
                      </Link>
                    ))}
                    <Link
                      href="/collection"
                      className="block py-3 text-base font-semibold text-amber-400 hover:text-amber-300 transition-colors min-h-[44px]"
                      onClick={() => setIsOpen(false)}
                    >
                      Voir toute la collection →
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            // Mobile dropdown for Blog
            if (item.id === 'blog' && item.hasDropdown) {
              return (
                <Collapsible key={item.id} className="w-full">
                  <CollapsibleTrigger className="w-full flex items-center justify-between py-3 text-base font-semibold text-white/90 hover:text-amber-300 transition-colors min-h-[44px]">
                    <span>{text}</span>
                    <ChevronDown size={18} className="opacity-70" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1 mt-2">
                    {recentBlogPosts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="block py-3 text-base text-white/70 hover:text-amber-300 transition-colors min-h-[44px]"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="font-semibold">{truncateText(post.title, 40)}</div>
                        <div className="text-xs text-white/50 mt-1">{formatBlogDate(post.publishedAt)}</div>
                      </Link>
                    ))}
                    <Link
                      href="/blog"
                      className="block py-3 text-base font-semibold text-amber-400 hover:text-amber-300 transition-colors min-h-[44px]"
                      onClick={() => setIsOpen(false)}
                    >
                      Voir tous les articles →
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            // Regular mobile link
            return (
              <Link
                key={item.id}
                href={item.href}
                className="block py-3 text-base font-semibold text-white/90 hover:text-amber-300 transition-colors min-h-[44px]"
                onClick={() => setIsOpen(false)}
              >
                {text}
              </Link>
            )
          })}

          <div className="pt-6 space-y-3 border-t border-white/10 mt-4">
            <Link
              href="/wishlist"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/30 p-4 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all relative min-h-[52px]"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-linear-to-r from-rose-400 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-base font-semibold">Favoris</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/30 p-4 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all relative min-h-[52px]"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-linear-to-r from-amber-400 to-orange-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-base font-semibold">Panier</span>
            </Link>

            {/* Login/Profile Button */}
            {status === 'authenticated' && session ? (
              <div className="space-y-2">
                <div className="px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/30">
                  <p className="text-xs text-amber-300/70 uppercase tracking-widest font-bold">Connecté</p>
                  <p className="text-base font-bold text-white truncate">{session.user?.name || session.user?.email}</p>
                </div>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/30 p-4 text-white bg-linear-to-b from-white/15 to-white/5 transition-all min-h-[52px]"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-base font-semibold">Tableau de bord</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/30 p-4 text-white bg-linear-to-b from-white/15 to-white/5 transition-all min-h-[52px]"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={22} />
                  <span className="text-base font-semibold">Mon Profil</span>
                </Link>
                <form action="/api/auth/signout" method="POST" className="w-full">
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 p-4 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all min-h-[52px]"
                  >
                    <span className="text-base font-semibold">Déconnexion</span>
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/50 p-4 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-all min-h-[52px]"
                onClick={() => setIsOpen(false)}
              >
                <User size={22} />
                <span className="text-base font-semibold">Connexion</span>
              </Link>
            )}
          </div>
          </div>
        </div>
      )}
    </>
  )
}

