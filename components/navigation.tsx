'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const navItems = [
  { id: 'home', fr: 'Accueil', en: 'Home', href: '/' },
  { id: 'vespas', fr: 'Nos Vespas', en: 'Our Vespas', href: '/collection' },
  { id: 'custom', fr: 'Personnalisation', en: 'Customization', href: '/personalization' },
  { id: 'delivery', fr: 'Livraison', en: 'Delivery', href: '#delivery' },
  { id: 'contact', fr: 'Contact', en: 'Contact', href: '#contact' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  const toggleLang = () => setLang((prev) => (prev === 'fr' ? 'en' : 'fr'))

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
              const isExternal = item.href.startsWith('#')
              
              if (isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors"
                  >
                    {text}
                  </a>
                )
              }
              
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
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="ml-4 border-white/30 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all"
            >
              {lang === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </Button>
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
              const isExternal = item.href.startsWith('#')
              
              if (isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="block py-2 text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {text}
                  </a>
                )
              }
              
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
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="mt-4 w-full border-white/30 text-white bg-linear-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all"
            >
              {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

