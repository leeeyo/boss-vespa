import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Wrench, Truck } from 'lucide-react'

const services = [
  {
    icon: ShoppingBag,
    title: 'Vente de Vespas',
    titleEn: 'Vespa Sales',
    description: 'Large sélection de modèles Vespa neufs avec toutes les couleurs et finitions disponibles',
    descriptionEn: 'Wide selection of new Vespa models with all colors and finishes available',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    icon: Wrench,
    title: 'Atelier de Personnalisation',
    titleEn: 'Custom Shop',
    description: 'Personnalisez votre Vespa selon vos envies : peinture custom, accessoires, modifications uniques',
    descriptionEn: 'Customize your Vespa: custom paint, accessories, unique modifications',
    color: 'from-red-400 to-pink-400',
  },
  {
    icon: Truck,
    title: 'Livraison à Domicile',
    titleEn: 'Home Delivery',
    description: 'Service de livraison dans toute la Tunisie avec paiement à la livraison',
    descriptionEn: 'Delivery service throughout Tunisia with cash on delivery',
    color: 'from-blue-400 to-cyan-400',
  },
]

export function Services() {
  return (
    <section id="custom" className="py-20 px-4 bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
            Nos Services
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            De la vente à la personnalisation, nous offrons une expérience complète pour tous les passionnés de Vespa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.title}
                className="relative border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-yellow-400 via-red-400 to-blue-400" />
                <CardHeader className="pt-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{service.title}</CardTitle>
                  <CardDescription className="text-xs text-white/60 uppercase tracking-[0.4em]">
                    {service.titleEn}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-base text-white/90 leading-relaxed">{service.description}</p>
                  <p className="text-sm text-white/60 italic">{service.descriptionEn}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
