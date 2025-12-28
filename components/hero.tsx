'use client'

import Image from 'next/image'
import { ArrowDown } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'

import heroStill from '@/public/images/hero.jpg'

const highlights = [
  { fr: '50+ modèles disponibles', en: '50+ models available' },
  { fr: 'Livraison gratuite', en: 'Free delivery' },
  { fr: 'Garantie 2 ans', en: '2 year warranty' },
]

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-gray-900"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-40 blur-3xl bg-linear-to-br from-amber-500/40 via-rose-500/30 to-sky-500/30" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[calc(100vh-4rem)] lg:py-18 px-4 lg:px-18">
            <div className="w-full max-w-2xl text-center lg:text-left space-y-6 lg:order-1 order-2">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-300 font-semibold">Boss Vespa</p>
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white leading-tight text-balance">
                  Découvrez votre Vespa idéale
                </h1>
              </div>
              <p className="text-base lg:text-lg text-white/80 text-balance">
                Explorez notre large sélection de modèles Vespa et personnalisez votre scooter selon vos envies. 
                Des couleurs vibrantes aux finitions premium, trouvez le modèle qui vous correspond.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-3">
                {highlights.map((item) => (
                  <span
                    key={item.fr}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium text-white shadow-sm backdrop-blur"
                  >
                    {item.fr}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold shadow-[0_18px_35px_rgba(250,204,21,0.45)] hover:from-amber-300 hover:to-orange-400 translate-y-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => document.getElementById('vespas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Découvrir nos Vespas
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/40 bg-white/5 text-white font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.55)] hover:bg-white/15 translate-y-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => window.location.href = '/personalization'}
                >
                  Personnaliser ma Vespa
                </Button>
              </div>

              <div className="items-center justify-center lg:justify-start gap-3 text-white/70 hidden lg:flex">
                <ArrowDown className="h-5 w-5 animate-bounce" />
                <span className="text-sm font-semibold uppercase tracking-[0.4em]">Faites défiler</span>
              </div>
            </div>

            <div className="w-full max-w-xl space-y-4 lg:order-2 order-1 mt-8 lg:mt-0">
              <div className="grid grid-cols-2 gap-4 my-10">
                <MediaCard>
                  <Image
                    src={heroStill}
                    alt="Vespa colorée au showroom Boss Vespa"
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </MediaCard>
                <MediaCard>
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    playsInline
                    muted
                    loop
                    poster={heroStill.src}
                    aria-label="Vidéo de présentation Boss Vespa Mahdia"
                  >
                    <source src="/images/welcome.mp4" type="video/mp4" />
                  </video>
                </MediaCard>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 shadow-xl backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Pourquoi Boss Vespa</p>
                <p className="text-lg font-semibold text-white">
                  Large choix de modèles · Personnalisation sur mesure · Livraison dans toute la Tunisie
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MediaCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 -translate-x-2 translate-y-2 rounded-3xl bg-linear-to-br from-amber-400/40 via-rose-400/40 to-blue-500/30 blur-2xl opacity-70" />
      <div className="relative rounded-3xl border border-white/20 bg-black/40 shadow-2xl overflow-hidden backdrop-blur">
        <AspectRatio ratio={9 / 16}>{children}</AspectRatio>
      </div>
    </div>
  )
}
