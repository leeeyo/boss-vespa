import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import accessory1 from '@/public/images/accessory1.png'
import green3 from '@/public/images/green3.png'
import heroStill from '@/public/images/hero.jpg'
import showcase2 from '@/public/images/showcase2.jpg'
import showcase5 from '@/public/images/showcase5.png'
import white2 from '@/public/images/white2.jpeg'

const vespas = [
  {
    image: heroStill,
    title: 'Vespa Sprint Art Series',
    color: 'Jaune matte · accents orange',
    description: 'Carénages satinés, pare-brise sport et sellerie sur-mesure.',
    tag: 'Custom Shop',
  },
  {
    image: showcase2,
    title: 'Collection Showroom',
    color: 'Palette complète disponible',
    description: 'Sprint, Primavera, GTS – toutes prêtes à rouler.',
    tag: 'Showroom',
  },
  {
    image: white2,
    title: 'Primavera Classica',
    color: 'Blanc nacré',
    description: 'Le look intemporel italien avec équipement premium.',
    tag: 'Iconique',
  },
  {
    image: green3,
    title: 'Sprint Jungle',
    color: 'Vert sauge',
    description: 'Guidons noirs, jantes sombres et détails satinés.',
    tag: 'Édition limitée',
  },
  {
    image: accessory1,
    title: 'Accessoires assortis',
    color: 'Casques, bagagerie, pièces d’origine',
    description: 'Mix & match pour créer votre combo parfait.',
    tag: 'Accessoires',
  },
  {
    image: showcase5,
    title: 'Préparation Livraison',
    color: 'Contrôle complet avant expédition',
    description: 'Chaque Vespa est testée et sécurisée pour le transport.',
    tag: 'Delivery Ready',
  },
]

export function VespaShowcase() {
  return (
    <section id="vespas" className="py-20 px-4 bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
            Nos Vespas
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Découvrez une sélection de modèles prêts à exposer, et imaginez votre propre création grâce à notre atelier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vespas.map((vespa) => (
            <Card
              key={vespa.title}
              className="group overflow-hidden border border-white/10 bg-white/5 backdrop-blur text-white"
            >
              <div className="relative">
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src={vespa.image}
                    alt={vespa.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    placeholder="blur"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 shadow-md">
                  {vespa.tag}
                </Badge>
              </div>
              <CardContent className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{vespa.title}</h3>
                  <p className="text-sm text-amber-300 font-semibold">{vespa.color}</p>
                </div>
                <p className="text-white/80">{vespa.description}</p>
                <Button className="w-full bg-linear-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400">
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
