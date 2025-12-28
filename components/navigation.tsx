import Image from 'next/image'
import Link from 'next/link'
import { Banknote } from 'lucide-react'

import { getScooterModelsByType } from '@/lib/products'
import { getRecentBlogPosts } from '@/lib/blog'
import { NavigationClient } from './navigation-client'

function TopBanner() {
  return (
    <div className="bg-amber-400 text-black py-2 px-4 text-center text-xs font-bold tracking-widest uppercase relative z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="hidden md:flex gap-4">
           <span>+216 97 310 394</span>
           <span>•</span>
           <span>contact@boss-vespa.tn</span>
        </div>
        <div className="flex justify-center items-center gap-6">
          <Link href="/sell" className="hover:underline inline-flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded-full leading-none">
            <Banknote size={12} />
            Vendez votre scooter
          </Link>
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

export async function Navigation() {
  // Fetch data for dropdowns
  const [scooterModels, recentBlogPosts] = await Promise.all([
    getScooterModelsByType(),
    getRecentBlogPosts(6),
  ])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
      <TopBanner />
      <div className="h-px bg-black/20 w-full relative z-50"></div>
      <nav className="border-b border-white/10 bg-linear-to-r from-slate-950 via-slate-900 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="Accueil Boss Vespa">
                <Image src="/logo.png" alt="Boss Vespa" width={48} height={48} className="rounded-full hover:scale-120 transition-all duration-300" />
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Mahdia · Tunisia</p>
              </div>
            </div>

            <NavigationClient 
              scooterModels={scooterModels}
              recentBlogPosts={recentBlogPosts}
            />
          </div>
        </div>
      </nav>
    </header>
  )
}
