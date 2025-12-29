import { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'À Propos',
  description: 'Découvrez Boss Vespa à Mahdia, votre partenaire de confiance pour la vente et la personnalisation de Vespas en Tunisie.',
  path: '/about',
  image: '/images/hero.jpg',
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />

      <main className="container mx-auto px-4 pt-40 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-400/30 text-amber-300 tracking-widest uppercase text-xs px-3 py-1">
              Notre Histoire
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
              Boss Vespa Mahdia
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Plus qu&apos;un simple concessionnaire, nous sommes des artisans passionnés de la culture Vespa en Tunisie.
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid gap-12 md:gap-24">
            {/* Section 1: The Passion */}
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-amber-400">Une Passion Née à Mahdia</h2>
                <div className="w-20 h-1 bg-amber-400/50 rounded-full"></div>
                <p className="text-white/70 leading-relaxed">
                  Installés au cœur de Mahdia, nous avons transformé notre passion pour les scooters italiens en une véritable institution. 
                  Boss Vespa n&apos;est pas seulement un point de vente, c&apos;est un lieu de rencontre pour les amateurs de style et de liberté.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Nous croyons que chaque trajet mérite d&apos;être exceptionnel. C&apos;est pourquoi nous sélectionnons rigoureusement chaque modèle 
                  et proposons des personnalisations uniques qui reflètent votre personnalité.
                </p>
              </div>
              <div className="flex-1 relative aspect-square md:aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-tr from-amber-500/20 to-purple-500/20 mix-blend-overlay z-10"></div>
                <Image
                  src="/images/hero.jpg"
                  alt="Boss Vespa Mahdia"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 448px, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-tr from-amber-500/20 to-purple-500/20 mix-blend-overlay z-10"></div>
              </div>
            </div>

            {/* Section 2: Expertise */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
               <div className="flex-1 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-sky-400">L&apos;Art de la Personnalisation</h2>
                <div className="w-20 h-1 bg-sky-400/50 rounded-full"></div>
                <p className="text-white/70 leading-relaxed">
                  Notre atelier est un laboratoire de créativité. Peinture sur mesure, sellerie artisanale, accessoires chromés... 
                  nous donnons vie à la Vespa de vos rêves.
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Peintures personnalisées haute qualité
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Restauration minutieuse
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Accessoires exclusifs
                  </li>
                </ul>
              </div>
              <div className="flex-1 relative aspect-square md:aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-tr from-sky-500/20 to-emerald-500/20 mix-blend-overlay z-10"></div>
                 {/* Placeholder for workshop image */}
                 <Image
                   src="/images/accessory2.png"
                   alt="Boss Vespa Mahdia"
                   fill
                   priority
                   className="object-cover"
                   sizes="(min-width: 1024px) 448px, 100vw"
                 />
              </div>
            </div>

             {/* Section 3: Commitment */}
             <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 text-center space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Notre Engagement</h2>
                <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
                  Que vous soyez à Mahdia, Tunis, Sousse ou ailleurs, nous nous engageons à vous offrir la même qualité de service. 
                  Notre service de livraison couvre tout le territoire tunisien, avec une garantie de satisfaction à la réception.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-3xl font-black text-amber-400 mb-2">100%</div>
                    <div className="text-sm text-white/60 uppercase tracking-wider">Satisfaction</div>
                  </div>
                   <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-3xl font-black text-rose-400 mb-2">24/7</div>
                    <div className="text-sm text-white/60 uppercase tracking-wider">Support Client</div>
                  </div>
                   <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-3xl font-black text-emerald-400 mb-2">TN</div>
                    <div className="text-sm text-white/60 uppercase tracking-wider">Livraison Nationale</div>
                  </div>
                </div>
             </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

