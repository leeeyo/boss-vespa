import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Wrench, Truck } from 'lucide-react'

const services = [
  {
    icon: ShoppingBag,
    title: 'Vente de Vespas',
    description: 'Large sélection de modèles Vespa neufs avec toutes les couleurs et finitions disponibles',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    icon: Wrench,
    title: 'Atelier de Personnalisation',
    description: 'Personnalisez votre Vespa selon vos envies : peinture custom, accessoires, modifications uniques',
    color: 'from-red-400 to-pink-400',
  },
  {
    icon: Truck,
    title: 'Livraison à Domicile',
    description: 'Service de livraison dans toute la Tunisie avec paiement à la livraison',
    color: 'from-blue-400 to-cyan-400',
  },
]

export function Services() {
  return (
    <section id="custom" className="py-12 px-4 bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
            Nos Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.title}
                className="relative border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-yellow-400 via-red-400 to-blue-400" />
                <CardHeader className="pt-4 pb-2">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${service.color} flex items-center justify-center mb-3 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-white/80 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
