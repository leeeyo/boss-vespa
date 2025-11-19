'use client'

import Image from 'next/image'
import { ArrowDown, MapPin } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'

import heroStill from '@/public/images/hero.jpg'

const highlights = [
  { fr: 'Vente & Showroom', en: 'Sales & Showroom' },
  { fr: 'Custom haute couture', en: 'Bespoke customization' },
  { fr: 'Livraison nationale', en: 'Nationwide delivery' },
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
          <div className="flex flex-col lg:flex-row items-center gap-12 min-h-[calc(100vh-4rem)] py-15 lg:py-18 px-18">
            <div className="w-full max-w-2xl text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur">
                <MapPin className="h-4 w-4" />
                Depuis Mahdia, Tunisie
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-300 font-semibold">Boss Vespa</p>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-tight text-balance">
                  L&apos;expérience Vespa la plus colorée du pays
                </h1>
              </div>
              <p className="text-lg text-white/80 text-balance">
                Vente, personnalisation artistique et livraison dans toute la Tunisie avec une équipe passionnée qui vit
                Vespa au quotidien.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {highlights.map((item) => (
                  <span
                    key={item.fr}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur"
                  >
                    {item.fr} · {item.en}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold shadow-[0_18px_35px_rgba(250,204,21,0.45)] hover:from-amber-300 hover:to-orange-400 translate-y-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => document.getElementById('vespas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Découvrir nos Vespas
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/5 text-white font-semibold shadow-[0_14px_28px_rgba(0,0,0,0.55)] hover:bg-white/15 translate-y-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contactez-nous
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 text-white/70">
                <ArrowDown className="h-5 w-5 animate-bounce" />
                <span className="text-sm font-semibold uppercase tracking-[0.4em]">Faites défiler</span>
              </div>
            </div>

            <div className="w-full max-w-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MediaCard>
                  <Image
                    src={heroStill}
                    alt="Vespa colorée au showroom Boss Vespa"
                    fill
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
                  >
                    <source src="/images/welcome.mp4" type="video/mp4" />
                  </video>
                </MediaCard>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/20 p-4 shadow-xl backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Mahdia • Tunisia</p>
                <p className="text-lg font-semibold text-white">
                  Vente · Personnalisation · Livraison — tout sous le même toit.
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
