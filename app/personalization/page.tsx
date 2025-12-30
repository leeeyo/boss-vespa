'use client'

import React from 'react'
import { useState, Suspense, useEffect, startTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
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
import { Share2, Check, ChevronRight, Package, ShoppingBag } from 'lucide-react'

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
  // Default to first model if none selected
  const [selectedModel, setSelectedModel] = useState<VespaModel | null>(
    modelParam && VESPA_MODELS.includes(modelParam as VespaModel) 
      ? modelParam as VespaModel 
      : null
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
              videos: product.videos || [],
              featuredMediaIndex: product.featuredMediaIndex,
              productId: product._id.toString(),
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
    // Require model selection before proceeding
    if (!selectedModel) {
      alert('Veuillez sélectionner un modèle Vespa avant de continuer')
      return
    }
    
    const params = new URLSearchParams()
    params.set('color', currentColor)
    params.set('model', selectedModel)
    if (selectedProduct) params.set('product', selectedProduct.slug)
    
    router.push(`/personalization/reservation?${params.toString()}`)
  }

  return (
    <div className="h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 flex flex-col overflow-hidden">
      <NavigationClientWrapper />

      <main className="flex-1 flex flex-col lg:flex-row pt-20 lg:pt-16 overflow-hidden mt-7">
        {/* 3D Scene - Left Side */}
        <div className="flex-1 relative min-h-0">
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

          {/* Model Info Badge - Top Left */}
          {selectedModel && (
            <div className="absolute top-4 left-4 bg-amber-400 text-slate-900 px-3 py-1.5 rounded-full text-sm font-bold z-10">
              Vespa {selectedModel}
            </div>
          )}

          {/* Share Button - Top Right (desktop) */}
          <div className="absolute top-4 right-40 hidden lg:block z-10">
            <Button
              onClick={handleShare}
              size="sm"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>

          {/* Matching Vespas Catalogue - Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="bg-linear-to-t from-slate-950 via-slate-950/95 to-transparent pt-8 pb-4 px-4">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-bold text-sm">
                    {hasMatches 
                      ? `${matchingProducts.length} Vespa${matchingProducts.length > 1 ? 's' : ''} disponible${matchingProducts.length > 1 ? 's' : ''}`
                      : 'Couleur personnalisée'
                    }
                  </span>
                </div>
                <Button
                  onClick={handleValidate}
                  size="sm"
                  disabled={!selectedModel}
                  className={`font-bold h-8 text-xs ${
                    selectedModel 
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-900' 
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {selectedModel ? 'Continuer' : 'Choisir un modèle'}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {/* Products Horizontal Scroll */}
              {hasMatches ? (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {matchingProducts.map((product) => {
                    const isSelected = selectedProduct?.slug === product.slug
                    return (
                      <button
                        key={product.slug}
                        onClick={() => setSelectedProduct(isSelected ? null : product)}
                        className={`group flex-shrink-0 w-28 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-amber-400 ring-2 ring-amber-400/20' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        {/* Product Image */}
                        <div className="aspect-square bg-slate-800/50 relative">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-white/20" />
                            </div>
                          )}
                          
                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-slate-900" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-2">
                          <h4 className="text-white text-[10px] font-medium truncate leading-tight">{product.name}</h4>
                          <p className="text-amber-400 text-xs font-bold">{product.price}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div 
                    className="w-10 h-10 rounded-lg shrink-0 border-2 border-white/20"
                    style={{ backgroundColor: currentColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">Couleur unique</p>
                    <p className="text-white/50 text-xs truncate">
                      Créez une commande personnalisée
                    </p>
                  </div>
                </div>
              )}

              {/* Selected Product Quick Info */}
              {selectedProduct && (
                <div className="mt-3 p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      {selectedProduct.images?.[0] && (
                        <Image
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">{selectedProduct.name}</h4>
                      <p className="text-amber-400 font-bold text-sm">{selectedProduct.price}</p>
                    </div>
                  </div>
                  <Link href={`/product/${selectedProduct.slug}`}>
                    <Button size="sm" variant="outline" className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 h-8 text-xs">
                      Voir
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Color Picker Panel - Right Side */}
        <div className="h-[45vh] lg:h-auto lg:w-[300px] xl:w-[320px] border-t lg:border-t-0 lg:border-l border-white/10 z-20 relative bg-slate-900/95 backdrop-blur-xl overflow-y-auto">
          <ColorPickerPanel 
            currentColor={currentColor} 
            onColorChange={setCurrentColor}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
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
          <div className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
            <div className="h-16 bg-linear-to-r from-slate-950 via-slate-900 to-gray-900 border-b border-white/10" />
          </div>
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
