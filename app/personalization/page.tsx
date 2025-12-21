'use client'

import React from 'react'
import { useState, Suspense, useEffect, startTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { CustomizerScene } from '@/components/customizer-scene'
import { ColorPickerPanel } from '@/components/color-picker-panel'
import { WebGLFallback } from '@/components/webgl-fallback'
import { SimpleVespaViewer } from '@/components/simple-vespa-viewer'
import { findAllMatchingProducts, VESPA_MODELS, VespaModel } from '@/utils/color-matching'
import { VespaProduct } from '@/data/vespa'
import { IProduct } from '@/models/Product'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Share2, Check, ChevronRight, Package } from 'lucide-react'

type ProductsApiResponse = {
  products: IProduct[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

function PersonalizationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const colorParam = searchParams.get('color')
  const modelParam = searchParams.get('model') as VespaModel | null
  
  const [currentColor, setCurrentColor] = useState(colorParam || '#3d7c4a') // Default to Vert Jungle
  const [selectedModel, setSelectedModel] = useState<VespaModel | null>(
    modelParam && VESPA_MODELS.includes(modelParam as VespaModel) ? modelParam as VespaModel : null
  )
  const [selectedProduct, setSelectedProduct] = useState<VespaProduct | null>(null)
  const [webglError, setWebglError] = useState(false)
  const [use2DFallback, setUse2DFallback] = useState(false)
  const [products, setProducts] = useState<VespaProduct[]>([])

  // Update color from URL params
  useEffect(() => {
    if (colorParam) {
      startTransition(() => {
        setCurrentColor(colorParam)
      })
    }
  }, [colorParam])

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl')
      if (!gl) {
        startTransition(() => {
          setWebglError(true)
        })
      }
    } catch (e) {
      console.error(e)
      startTransition(() => {
        setWebglError(true)
      })
    }
  }, [])

  // Fetch only Vespa scooters from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        // Only fetch scooters with "Vespa" in the name
        const response = await fetch('/api/products?category=scooter&isActive=true&search=Vespa&limit=100')
        if (response.ok) {
          const data = (await response.json()) as ProductsApiResponse
          // Transform API response to VespaProduct format
          const transformed = data.products.map((product: IProduct) => {
            const formattedPrice = new Intl.NumberFormat('fr-FR', {
              style: 'decimal',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(product.price) + ' TND'
            
            return {
              slug: product.slug,
              name: product.name,
              subtitle: product.subtitle || '',
              category: product.category,
              color: product.color || '',
              description: product.description || '',
              price: formattedPrice,
              rawPrice: product.price,
              specs: product.technicalInfo || [],
              images: product.images || [],
            }
          })
          setProducts(transformed)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  // Find matching products based on current color and model
  const matchingProducts = findAllMatchingProducts(currentColor, products, selectedModel)
  const hasMatches = matchingProducts.length > 0

  const handleShare = () => {
    const url = `${window.location.origin}/personalization?color=${encodeURIComponent(currentColor)}${selectedModel ? `&model=${selectedModel}` : ''}`
    if (navigator.share) {
      navigator.share({
        title: 'Ma Vespa personnalisée',
        text: 'Regardez ma Vespa personnalisée!',
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Lien copié dans le presse-papiers!')
    }
  }

  const handleValidate = () => {
    const params = new URLSearchParams()
    params.set('color', currentColor)
    if (selectedModel) params.set('model', selectedModel)
    if (selectedProduct) params.set('product', selectedProduct.slug)
    
    router.push(`/personalization/reservation?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col pt-20 lg:pt-24">
        {/* Top Section: 3D Model + Color Picker */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-[60vh]">
          {/* 3D Scene - Left Side */}
          <div className="h-[40vh] lg:h-auto lg:flex-1 relative min-h-[250px]">
            <div className="w-full h-full">
              {use2DFallback ? (
                <SimpleVespaViewer color={currentColor} />
              ) : webglError ? (
                <WebGLFallback />
              ) : (
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
                      <div className="text-white/60 text-center">
                        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="font-semibold mb-2">Chargement de votre Vespa...</p>
                        <p className="text-xs text-white/40 max-w-xs mx-auto">
                          Si le chargement prend trop de temps, 
                          <button 
                            onClick={() => setUse2DFallback(true)}
                            className="text-amber-400 hover:text-amber-300 ml-1 underline"
                          >
                            cliquez ici
                          </button> pour le mode simplifié
                        </p>
                      </div>
                    </div>
                  }
                >
                  <CustomizerScene color={currentColor} />
                </Suspense>
              )}
            </div>

            {/* Model Info Badge */}
            {selectedModel && (
              <div className="absolute top-4 left-4 bg-amber-400 text-slate-900 px-3 py-1.5 rounded-full text-sm font-bold">
                Vespa {selectedModel}
              </div>
            )}

            {/* Share Button */}
            <div className="absolute bottom-4 right-4 hidden lg:block">
              <Button
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>

          {/* Color Picker Panel - Right Side */}
          <div className="flex-1 lg:flex-none lg:w-[28%] lg:h-auto border-t lg:border-t-0 lg:border-l border-white/10 z-20 relative bg-slate-900/95 backdrop-blur-xl overflow-y-auto">
            <ColorPickerPanel 
              currentColor={currentColor} 
              onColorChange={setCurrentColor}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>

        {/* Bottom Section: Matching Products Catalogue */}
        <div className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {hasMatches 
                    ? `${matchingProducts.length} Vespa${matchingProducts.length > 1 ? 's' : ''} disponible${matchingProducts.length > 1 ? 's' : ''}`
                    : 'Aucune Vespa en stock'
                  }
                </h3>
                <p className="text-white/50 text-sm">
                  {hasMatches 
                    ? 'Sélectionnez un modèle ou continuez avec une configuration personnalisée'
                    : 'Cette couleur nécessite une commande personnalisée'
                  }
                </p>
              </div>
              
              <Button
                onClick={handleValidate}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold"
              >
                Continuer
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Products Grid */}
            {hasMatches ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {matchingProducts.map((product) => {
                  const isSelected = selectedProduct?.slug === product.slug
                  return (
                    <button
                      key={product.slug}
                      onClick={() => setSelectedProduct(isSelected ? null : product)}
                      className={`group relative bg-white/5 rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-amber-400 ring-2 ring-amber-400/20' 
                          : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-slate-800 relative">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        
                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-slate-900" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-2">
                        <h4 className="text-white text-xs font-medium truncate">{product.name}</h4>
                        <p className="text-amber-400 text-sm font-bold">{product.price}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-8 text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white/10"
                  style={{ backgroundColor: currentColor }}
                />
                <h4 className="text-white font-bold mb-2">Couleur Unique</h4>
                <p className="text-white/50 text-sm max-w-md mx-auto">
                  Cette couleur n&apos;est pas en stock. Continuez pour créer une commande personnalisée.
                </p>
              </div>
            )}

            {/* Selected Product Summary */}
            {selectedProduct && (
              <div className="mt-4 p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {selectedProduct.images?.[0] && (
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{selectedProduct.name}</h4>
                    <p className="text-amber-400 font-bold text-lg">{selectedProduct.price}</p>
                  </div>
                </div>
                <Link href={`/product/${selectedProduct.slug}`}>
                  <Button variant="outline" className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10">
                    Voir le produit
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PersonalizationPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 flex flex-col overflow-hidden">
          <Navigation />
          <main className="flex-1 flex items-center justify-center pt-16">
            <div className="text-white/60 text-center">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold">Chargement...</p>
            </div>
          </main>
        </div>
      }
    >
      <PersonalizationContent />
    </Suspense>
  )
}
