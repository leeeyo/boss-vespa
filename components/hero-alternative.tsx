'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, ArrowRight, Clock, Users, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { vespaProducts } from '@/data/vespa'

export function HeroAlternative() {
  const [hoveredVespa, setHoveredVespa] = useState<string | null>(null)
  const [viewing, setViewing] = useState(3)

  // Simulate live viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewing((prev) => prev + Math.floor(Math.random() * 3) - 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        {/* Hero Headline */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/5 backdrop-blur">
            <Sparkles className="text-amber-400" size={16} />
            <span className="text-sm text-amber-300">Collection Exclusive 2024</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1]">
            Vivez l'élégance
            <span className="block bg-linear-to-r from-amber-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              à l'italienne
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Des modèles iconiques, prêts à transformer chaque trajet en une expérience inoubliable
          </p>

          {/* Social Proof - Subtle */}
          <div className="flex items-center justify-center gap-6 text-sm text-white/50 pt-4">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{viewing} personnes regardent maintenant</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>2 réservées aujourd'hui</span>
            </div>
          </div>
        </div>

        {/* Featured Vespas - Interactive Cards */}
        <div className="max-w-7xl mx-auto space-y-8">
          {vespaProducts.map((vespa, index) => (
            <div
              key={vespa.slug}
              onMouseEnter={() => setHoveredVespa(vespa.slug)}
              onMouseLeave={() => setHoveredVespa(null)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur transition-all duration-500 hover:border-amber-400/30 hover:bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(251,191,36,0.15)]"
            >
              <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 p-8 lg:p-12">
                {/* Left: Image & Info */}
                <div className="space-y-6">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black/30">
                    <Image
                      src={vespa.images[0]}
                      alt={vespa.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      priority={index === 0}
                    />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4 px-4 py-2 rounded-full border border-amber-400/50 bg-amber-400/10 backdrop-blur">
                      <span className="text-sm font-semibold text-amber-300">Stock limité</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.5em] text-amber-300">{vespa.subtitle}</p>
                    <h2 className="text-3xl md:text-4xl font-black">{vespa.name}</h2>
                    <p className="text-white/70 leading-relaxed">{vespa.description}</p>
                  </div>
                </div>

                {/* Right: Details & CTA */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-6">
                    {/* Price - Prominent but not pushy */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <p className="text-sm text-white/50 mb-2">À partir de</p>
                      <p className="text-4xl font-bold text-white">{vespa.price}</p>
                      <p className="text-xs text-white/40 mt-2">Financement disponible</p>
                    </div>

                    {/* Quick Specs - Minimal */}
                    <div className="space-y-2">
                      {vespa.specs.slice(0, 2).map((spec) => (
                        <div key={spec.label} className="flex items-center justify-between text-sm py-3 border-b border-white/5">
                          <span className="text-white/50">{spec.label}</span>
                          <span className="font-semibold">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Soft CTAs */}
                  <div className="space-y-3">
                    <Link href={`/product/${vespa.slug}`}>
                      <Button className="w-full bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400 h-14 shadow-[0_8px_24px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.4)] transition-all">
                        Découvrir ce modèle
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </Link>
                    
                    <div className="flex gap-3">
                      <a
                        href="tel:+21650000000"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold"
                      >
                        <Phone size={16} />
                        Appeler
                      </a>
                      <a
                        href="https://wa.me/21650000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-green-400/20 bg-green-400/5 hover:bg-green-400/10 transition-colors text-sm font-semibold"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>

                    {/* Subtle trust signal */}
                    <p className="text-xs text-center text-white/40 pt-2">
                      Essai gratuit • Livraison 48h • Garantie 2 ans
                    </p>
                  </div>
                </div>
              </div>

              {/* Hover Effect - Subtle glow */}
              {hoveredVespa === vespa.slug && (
                <div className="absolute inset-0 bg-linear-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA - Very subtle */}
        <div className="text-center mt-20 space-y-4">
          <p className="text-white/50">Des questions sur nos modèles ?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-semibold"
          >
            Parlons de votre projet
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

