'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VespaProduct } from '@/data/vespa'

type ShowcaseTabsProps = {
  products: VespaProduct[]
}

export function ShowcaseTabs({ products }: ShowcaseTabsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'scooter' | 'accessory'>('all')
  
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.category === activeTab)

  return (
    <>
      <div className="flex justify-center mb-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Tout
            </TabsTrigger>
            <TabsTrigger value="scooter" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Scooters
            </TabsTrigger>
            <TabsTrigger value="accessory" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Accessoires
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.slug}
            className="group overflow-hidden border border-white/10 bg-white/5 backdrop-blur text-white hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="relative">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src={product.images[0] as string}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 shadow-md">
                {product.category === 'scooter' ? 'Scooter' : 'Accessoire'}
              </Badge>
            </div>
            <CardContent className="p-6 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-white">{product.name}</h3>
                <p className="text-sm text-amber-300 font-semibold">{product.color}</p>
              </div>
              <p className="text-white/80 text-sm line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">{product.price}</span>
                <Button 
                  asChild
                  className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400"
                >
                  <Link href={`/product/${product.slug}`} aria-label={`Voir les détails de ${product.name}`}>
                    Découvrir
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

