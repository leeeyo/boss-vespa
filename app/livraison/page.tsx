import { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  Banknote,
  Wallet,
  Clock,
  ShoppingCart,
  Package,
  Truck,
  Phone,
} from 'lucide-react'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Livraison Nationale | Boss Vespa',
  description:
    'Service de livraison disponible sur toute la Tunisie.',
}

export default function LivraisonPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-12 md:pt-32 md:pb-16">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-amber-400/30 text-amber-300 tracking-widest uppercase text-xs px-3 py-1">
            Service National
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent mb-4">
            Livraison Partout en Tunisie
          </h1>
          <div className="flex flex-col gap-2 max-w-2xl mx-auto">
            <p className="text-white/90 text-lg">
              Profitez de notre service de livraison sécurisé vers toutes les villes et régions.
            </p>
          </div>
        </div>

        {/* Delivery Information Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
                <MapPin size={20} />
              </div>
              <CardTitle className="text-lg text-white">Couverture Totale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm mb-2">
                Livraison garantie sur tout le territoire tunisien, sans exception.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 text-amber-400">
                <Banknote size={20} />
              </div>
              <CardTitle className="text-lg text-white">Tarifs Simples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Mahdia</span>
                  <span className="text-emerald-400 font-bold">Gratuit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Sahel</span>
                  <span className="text-white font-bold">50 TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Reste Tunisie</span>
                  <span className="text-white font-bold">100 TND</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 text-sky-400">
                <Clock size={20} />
              </div>
              <CardTitle className="text-lg text-white">Délais Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-white/80">
                  <span className="block font-semibold text-white">24h - 48h</span>
                  Zones côtières et Sahel
                </p>
                <p className="text-white/80">
                  <span className="block font-semibold text-white">48h - 72h</span>
                  Reste du territoire
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                <Wallet size={20} />
              </div>
              <CardTitle className="text-lg text-white">Paiement COD</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm mb-2">
                Payez en espèces uniquement à la réception de votre moto.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Process Steps */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <div className="mx-auto w-12 h-12 rounded-full bg-linear-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-lg mb-4 text-slate-900">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2">1. Commandez</h3>
              <p className="text-white/70 text-sm mb-2">
                Réservez votre Vespa en ligne ou par téléphone.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <div className="mx-auto w-12 h-12 rounded-full bg-linear-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-lg mb-4 text-slate-900">
                <Package size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2">2. Préparation</h3>
              <p className="text-white/70 text-sm mb-2">
                Contrôle technique complet et emballage sécurisé.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <div className="mx-auto w-12 h-12 rounded-full bg-linear-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-lg mb-4 text-slate-900">
                <Truck size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2">3. Réception</h3>
              <p className="text-white/70 text-sm mb-2">
                Vérifiez la moto chez vous avant de payer.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Questions Fréquentes</h2>
            <p className="text-white/50 text-sm mb-6">
              Tout ce que vous devez savoir sur la livraison.
            </p>
            
            <Card className="border-t-4 border-amber-400 bg-white/5 backdrop-blur-md border-x-0 border-b-0 p-6">
               <h3 className="font-bold text-lg mb-2 text-white">Besoin d&apos;aide ?</h3>
               <p className="text-sm text-white/70 mb-4">
                 Notre équipe est disponible 7j/7 pour répondre à vos questions.
               </p>
               <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
                 <Link href="tel:+21697310394">
                   <Phone size={16} className="mr-2" />
                   Contactez-nous
                 </Link>
               </Button>
            </Card>
          </div>

          <div className="space-y-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-3">
                  <span className="text-left">Quelles sont les zones exactes de livraison ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-white/80 space-y-2">
                  <p>Nous couvrons 100% du territoire tunisien. Peu importe votre ville ou village, notre transporteur arrivera jusqu&apos;à votre porte.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-3">
                  <span className="text-left">Le paiement est-il sécurisé ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-white/80 space-y-2">
                  <p>Oui, totalement. Vous ne payez qu&apos;après avoir reçu, vu et vérifié la Vespa. Aucun paiement en ligne n&apos;est requis.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-3">
                  <span className="text-left">Puis-je refuser la livraison ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-white/80 space-y-2">
                  <p>Absolument. Si la moto ne correspond pas à vos attentes lors de la livraison, vous pouvez la refuser sans frais.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-amber-300 hover:no-underline py-3">
                  <span className="text-left">Comment suivre ma commande ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-white/80 space-y-2">
                  <p>Nous vous envoyons le numéro du chauffeur dès que la moto quitte notre atelier pour une coordination directe.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
