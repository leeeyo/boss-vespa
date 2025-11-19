'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type CollectionFiltersProps = {
  colors: string[]
  engines: string[]
  features: string[]
  priceRange: { min: number; max: number }
}

export function CollectionFilters({ colors, engines, features, priceRange }: CollectionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const isInitialMount = useRef(true)

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  )
  const [selectedEngines, setSelectedEngines] = useState<string[]>(
    searchParams.get('engines')?.split(',').filter(Boolean) || []
  )
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    searchParams.get('features')?.split(',').filter(Boolean) || []
  )
  const [minPrice, setMinPrice] = useState(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : priceRange.min
  )
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : priceRange.max
  )

  // Update URL when filters change (skip on initial mount)
  useEffect(() => {
    // Skip the first render to prevent infinite loop
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams()

      if (search) params.set('search', search)
      if (selectedColors.length > 0) params.set('colors', selectedColors.join(','))
      if (selectedEngines.length > 0) params.set('engines', selectedEngines.join(','))
      if (selectedFeatures.length > 0) params.set('features', selectedFeatures.join(','))
      if (minPrice !== priceRange.min) params.set('minPrice', minPrice.toString())
      if (maxPrice !== priceRange.max) params.set('maxPrice', maxPrice.toString())

      const queryString = params.toString()
      const newUrl = queryString ? `/collection?${queryString}` : '/collection'
      
      // Only push if URL actually changed
      if (window.location.pathname + window.location.search !== newUrl) {
        startTransition(() => {
          router.push(newUrl, { scroll: false })
        })
      }
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedColors, selectedEngines, selectedFeatures, minPrice, maxPrice])

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const handleEngineToggle = (engine: string) => {
    setSelectedEngines((prev) =>
      prev.includes(engine) ? prev.filter((e) => e !== engine) : [...prev, engine]
    )
  }

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  const clearAllFilters = () => {
    setSearch('')
    setSelectedColors([])
    setSelectedEngines([])
    setSelectedFeatures([])
    setMinPrice(priceRange.min)
    setMaxPrice(priceRange.max)
    isInitialMount.current = true // Reset to prevent URL update
    startTransition(() => {
      router.push('/collection')
    })
  }

  const hasActiveFilters =
    search ||
    selectedColors.length > 0 ||
    selectedEngines.length > 0 ||
    selectedFeatures.length > 0 ||
    minPrice !== priceRange.min ||
    maxPrice !== priceRange.max

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Filtres</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-amber-400 hover:text-amber-300 hover:bg-white/5"
          >
            <X className="w-4 h-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-white/80 text-sm font-semibold">
          Rechercher
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            id="search"
            type="text"
            placeholder="Nom ou modèle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-semibold">Prix (TND)</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              min={priceRange.min}
              max={priceRange.max}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400/50"
            />
            <span className="text-white/40">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              min={priceRange.min}
              max={priceRange.max}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400/50"
            />
          </div>
          <div className="flex justify-between text-xs text-white/50">
            <span>{priceRange.min.toLocaleString()} TND</span>
            <span>{priceRange.max.toLocaleString()} TND</span>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-semibold">Couleurs</Label>
        <div className="space-y-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={() => handleColorToggle(color)}
                className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label
                htmlFor={`color-${color}`}
                className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
              >
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Engines */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-semibold">Moteur</Label>
        <div className="space-y-2">
          {engines.map((engine) => (
            <div key={engine} className="flex items-center space-x-2">
              <Checkbox
                id={`engine-${engine}`}
                checked={selectedEngines.includes(engine)}
                onCheckedChange={() => handleEngineToggle(engine)}
                className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label
                htmlFor={`engine-${engine}`}
                className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
              >
                {engine}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-semibold">Équipements</Label>
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature}`}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={() => handleFeatureToggle(feature)}
                className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <Label
                htmlFor={`feature-${feature}`}
                className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
              >
                {feature}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

