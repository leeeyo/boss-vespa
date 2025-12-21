'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Banknote,
  Clock,
  ShoppingCart,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
  Phone,
  CheckCircle2,
} from 'lucide-react'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const slides = [
  {
    icon: MapPin,
    title: 'Tunisie Entière',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Banknote,
    title: 'Paiement COD',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: Clock,
    title: '24h - 72h',
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-500/10',
    iconColor: 'text-sky-400',
  },
  {
    icon: CheckCircle2,
    title: 'Vérifiez Avant',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
]

const pricing = [
  { zone: 'Mahdia', price: 'Gratuit', highlight: true },
  { zone: 'Sahel', price: '50 TND', highlight: false },
  { zone: 'Tunisie', price: '100 TND', highlight: false },
]

const steps = [
  { icon: ShoppingCart, label: 'Commandez' },
  { icon: Package, label: 'Préparation' },
  { icon: Truck, label: 'Livraison' },
]

export default function LivraisonPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const CurrentIcon = slides[currentSlide].icon

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-12 md:pt-36 md:pb-16">
        {/* Hero Slideshow */}
        <div className="mb-16">
          <div className="relative max-w-2xl mx-auto">
            {/* Main Slide */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-linear-to-br ${slides[currentSlide].color} opacity-10`} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full ${slides[currentSlide].bgColor} flex items-center justify-center mb-6 shadow-2xl`}>
                  <CurrentIcon className={`w-12 h-12 md:w-16 md:h-16 ${slides[currentSlide].iconColor}`} />
                </div>
                <h2 className={`text-3xl md:text-5xl font-black bg-linear-to-r ${slides[currentSlide].color} bg-clip-text text-transparent text-center`}>
                  {slides[currentSlide].title}
                </h2>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-amber-400' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing - Visual */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {pricing.map((item) => (
              <div
                key={item.zone}
                className={`relative px-8 py-6 rounded-2xl border text-center min-w-[140px] ${
                  item.highlight
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <p className="text-white/60 text-sm mb-1">{item.zone}</p>
                <p className={`text-2xl md:text-3xl font-black ${item.highlight ? 'text-emerald-400' : 'text-white'}`}>
                  {item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Steps - Visual Timeline */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg mb-2">
                    <step.icon className="w-7 h-7 md:w-10 md:h-10 text-black" />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-white/80">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 md:w-16 h-0.5 bg-linear-to-r from-amber-400 to-orange-500 mx-2 md:mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
          
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="item-1" className="border border-white/10 rounded-xl px-4 bg-white/5">
              <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-4">
                <span className="text-left text-sm md:text-base">Zones de livraison ?</span>
              </AccordionTrigger>
              <AccordionContent className="text-white/80 pb-4">
                <p>Nous couvrons 100% du territoire tunisien. Peu importe votre ville ou village, notre transporteur arrivera jusqu&apos;à votre porte.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-white/10 rounded-xl px-4 bg-white/5">
              <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-4">
                <span className="text-left text-sm md:text-base">Paiement sécurisé ?</span>
              </AccordionTrigger>
              <AccordionContent className="text-white/80 pb-4">
                <p>Oui, totalement. Vous ne payez qu&apos;après avoir reçu, vu et vérifié la Vespa. Aucun paiement en ligne n&apos;est requis.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-white/10 rounded-xl px-4 bg-white/5">
              <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-4">
                <span className="text-left text-sm md:text-base">Refus possible ?</span>
              </AccordionTrigger>
              <AccordionContent className="text-white/80 pb-4">
                <p>Absolument. Si la moto ne correspond pas à vos attentes lors de la livraison, vous pouvez la refuser sans frais.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-white/10 rounded-xl px-4 bg-white/5">
              <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-4">
                <span className="text-left text-sm md:text-base">Suivi commande ?</span>
              </AccordionTrigger>
              <AccordionContent className="text-white/80 pb-4">
                <p>Nous vous envoyons le numéro du chauffeur dès que la moto quitte notre atelier pour une coordination directe.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold">
              <Link href="tel:+21697310394">
                <Phone className="w-5 h-5 mr-2" />
                Appelez-nous
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
