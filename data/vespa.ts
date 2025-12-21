export type VespaProduct = {
  slug: string
  name: string
  subtitle: string
  category: 'scooter' | 'accessory'
  color: string
  description: string
  price: string
  specs: {
    label: string
    value: string
  }[]
  images: string[]
}

export const vespaProducts: VespaProduct[] = [
  {
    slug: 'vespa-sprint-s-125-green-jungle',
    name: 'Vespa Sprint S 125',
    subtitle: 'Green Jungle Edition',
    category: 'scooter',
    color: 'Vert Jungle & Blanc Crème',
    description:
      'Version sportive avec finitions satinées, jantes noires et détails lime pour une présence ultra moderne en ville.',
    price: '16 900 TND',
    specs: [
      { label: 'Moteur', value: '125 cc i-get' },
      { label: 'Finition', value: 'Green Jungle + inserts blancs' },
      { label: 'Freinage', value: 'ABS avant, disque 200 mm' },
      { label: 'Extras', value: 'Pare-brise sport, sellerie premium' },
    ],
    images: ['/images/green.jpg', '/images/green1.png', '/images/green2.png', '/images/green3.png', '/images/green4.png'],
  },
  {
    slug: 'vespa-primavera-125-bianco',
    name: 'Vespa Primavera 125',
    subtitle: 'Bianco Classico',
    category: 'scooter',
    color: 'Blanc perlé',
    description:
      'L’icône intemporelle Vespa avec touches chromées, idéale pour les balades méditerranéennes et les trajets quotidiens.',
    price: '15 200 TND',
    specs: [
      { label: 'Moteur', value: '125 cc i-get' },
      { label: 'Finition', value: 'Bianco + chrome' },
      { label: 'Freinage', value: 'ABS avant, disque 200 mm' },
      { label: 'Extras', value: 'Rack arrière, selle bicolore' },
    ],
    images: ['/images/white.jpg', '/images/white1.jpeg', '/images/white2.jpeg', '/images/white3.jpeg'],
  },
  {
    slug: 'casque-vespa-vintage',
    name: 'Casque Vespa Vintage',
    subtitle: 'Protection & Style',
    category: 'accessory',
    color: 'Blanc & Cuir',
    description: 'Casque jet avec visière solaire intégrée et finitions en cuir véritable.',
    price: '450 TND',
    specs: [
      { label: 'Matériau', value: 'Polycarbonate' },
      { label: 'Taille', value: 'M, L, XL' },
    ],
    images: ['/images/accessory.png'],
  },
  {
    slug: 'top-case-vespa',
    name: 'Top Case 32L',
    subtitle: 'Rangement supplémentaire',
    category: 'accessory',
    color: 'Noir Mat',
    description: 'Top case spacieux pouvant accueillir un casque intégral. Dossier passager inclus.',
    price: '890 TND',
    specs: [
      { label: 'Capacité', value: '32 Litres' },
      { label: 'Fixation', value: 'Support inclus' },
    ],
    images: ['/images/accessory1.png'],
  },
  {
    slug: 'pare-brise-haut',
    name: 'Pare-brise Haut',
    subtitle: 'Protection optimale',
    category: 'accessory',
    color: 'Transparent',
    description: 'Pare-brise haute protection en méthacrylate anti-rayures.',
    price: '380 TND',
    specs: [
      { label: 'Hauteur', value: '70 cm' },
      { label: 'Compatibilité', value: 'Primavera, Sprint' },
    ],
    images: ['/images/accessory2.png'],
  },
  {
    slug: 'housse-protection',
    name: 'Housse de Protection',
    subtitle: 'Intérieur & Extérieur',
    category: 'accessory',
    color: 'Gris',
    description: 'Housse imperméable avec logo Vespa, idéale pour protéger votre scooter.',
    price: '150 TND',
    specs: [
      { label: 'Matière', value: 'Nylon résistant' },
      { label: 'Taille', value: 'Universelle' },
    ],
    images: ['/images/accessory3.png'],
  },
   {
    slug: 'porte-bagage-arriere',
    name: 'Porte-bagage Arrière',
    subtitle: 'Style & Praticité',
    category: 'accessory',
    color: 'Chrome',
    description: 'Porte-bagage arrière rabattable chromé, le style classique Vespa.',
    price: '420 TND',
    specs: [
      { label: 'Matériau', value: 'Acier chromé' },
      { label: 'Charge max', value: '5 kg' },
    ],
    images: ['/images/accessory4.png'],
  },
   {
    slug: 'antivol-guidon',
    name: 'Antivol de Guidon',
    subtitle: 'Sécurité maximale',
    category: 'accessory',
    color: 'Noir',
    description: 'Antivol mécanique se fixant au guidon, simple et efficace.',
    price: '290 TND',
    specs: [
      { label: 'Type', value: 'Mécanique' },
      { label: 'Sécurité', value: 'Niveau 8/10' },
    ],
    images: ['/images/accessory5.png'],
  },
  {
    slug: 'poignees-cuir',
    name: 'Poignées en Cuir',
    subtitle: 'Toucher premium',
    category: 'accessory',
    color: 'Marron Vintage',
    description: 'Paire de poignées en cuir véritable pour un look rétro et une prise en main confortable.',
    price: '120 TND',
    specs: [
      { label: 'Matériau', value: 'Cuir véritable' },
      { label: 'Compatibilité', value: 'Universelle' },
    ],
    images: ['/images/accessory6.png'],
  },
  {
    slug: 'retroviseurs-embout',
    name: 'Rétroviseurs Embout de Guidon',
    subtitle: 'Style Café Racer',
    category: 'accessory',
    color: 'Noir',
    description: 'Rétroviseurs ronds à fixer en bout de guidon pour un style épuré et sportif.',
    price: '180 TND',
    specs: [
      { label: 'Matériau', value: 'Aluminium CNC' },
      { label: 'Diamètre', value: '80 mm' },
    ],
    images: ['/images/accessory7.jpg'],
  },
  {
    slug: 'sacoche-laterale',
    name: 'Sacoche Latérale Cuir',
    subtitle: 'Rangement élégant',
    category: 'accessory',
    color: 'Marron',
    description: 'Sacoche latérale en cuir étanche, idéale pour transporter vos essentiels avec style.',
    price: '350 TND',
    specs: [
      { label: 'Matériau', value: 'Cuir synthétique' },
      { label: 'Capacité', value: '15 Litres' },
    ],
    images: ['/images/accessory8.jpg'],
  },
]

export function getVespaBySlug(slug: string) {
  return vespaProducts.find((vespa) => vespa.slug === slug)
}

export function getFeaturedVespas(limit = 2) {
  return vespaProducts.slice(0, limit)
}

export type FilterOptions = {
  search?: string
  category?: 'scooter' | 'accessory' | 'all'
  colors?: string[]
  engines?: string[]
  features?: string[]
  minPrice?: number
  maxPrice?: number
}

// Extract unique categories
export function getAllCategories(): string[] {
    return Array.from(new Set(vespaProducts.map(p => p.category))).sort()
}

// Extract unique colors from all products
export function getAllColors(): string[] {
  const colors = vespaProducts.map((v) => v.color)
  return Array.from(new Set(colors)).sort()
}

// Extract unique engine types from specs
export function getAllEngines(): string[] {
  const engines = vespaProducts
    .map((v) => {
      const engineSpec = v.specs.find((s) => s.label === 'Moteur')
      return engineSpec?.value
    })
    .filter(Boolean) as string[]
  return Array.from(new Set(engines)).sort()
}

// Extract unique features from extras
export function getAllFeatures(): string[] {
  const features = vespaProducts
    .flatMap((v) => {
      const extrasSpec = v.specs.find((s) => s.label === 'Extras')
      if (!extrasSpec) return []
      // Split by comma and trim
      return extrasSpec.value.split(',').map((f) => f.trim())
    })
    .filter(Boolean)
  return Array.from(new Set(features)).sort()
}

// Get price range (min and max)
export function getPriceRange(): { min: number; max: number } {
  const prices = vespaProducts.map((v) => {
    // Extract numeric value from price string (e.g., "16 900 TND" -> 16900)
    const numericPrice = parseInt(v.price.replace(/\s/g, '').replace('TND', ''))
    return numericPrice
  })
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

// Main filtering function
export function filterVespas(filters: FilterOptions): VespaProduct[] {
  return vespaProducts.filter((vespa) => {
    // Category filter
    if (filters.category && filters.category !== 'all') {
        if (vespa.category !== filters.category) return false
    }

    // Search filter (name or subtitle)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        vespa.name.toLowerCase().includes(searchLower) ||
        vespa.subtitle.toLowerCase().includes(searchLower) ||
        vespa.description.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      if (!filters.colors.includes(vespa.color)) return false
    }

    // Engine filter
    if (filters.engines && filters.engines.length > 0) {
      const engineSpec = vespa.specs.find((s) => s.label === 'Moteur')
      if (!engineSpec || !filters.engines.includes(engineSpec.value)) return false
    }

    // Features filter
    if (filters.features && filters.features.length > 0) {
      const extrasSpec = vespa.specs.find((s) => s.label === 'Extras')
      if (!extrasSpec) return false
      const vespaFeatures = extrasSpec.value.split(',').map((f) => f.trim())
      const hasAllFeatures = filters.features.every((feature) =>
        vespaFeatures.some((vf) => vf.includes(feature) || feature.includes(vf))
      )
      if (!hasAllFeatures) return false
    }

    // Price filter
    const numericPrice = parseInt(vespa.price.replace(/\s/g, '').replace('TND', ''))
    if (filters.minPrice !== undefined && numericPrice < filters.minPrice) return false
    if (filters.maxPrice !== undefined && numericPrice > filters.maxPrice) return false

    return true
  })
}


