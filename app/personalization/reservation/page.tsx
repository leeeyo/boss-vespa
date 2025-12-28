'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Check, 
  Package, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  MessageSquare,
  Loader2,
  ShoppingBag,
  Palette,
  Bike,
  Send
} from 'lucide-react'
import { toast } from 'sonner'
import { VespaModel } from '@/utils/color-matching'
import { IProduct } from '@/models/Product'
import { getVespaModelPrice } from '@/utils/vespa-price-estimation'

interface Accessory {
  _id: string
  slug: string
  name: string
  price: number
  images: string[]
}

interface ContactInfo {
  name: string
  email: string
  phone: string
  address: string
}

function ReservationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get params from URL
  const colorParam = searchParams.get('color') || '#3d7c4a'
  const modelParam = searchParams.get('model') as VespaModel | null
  const productSlug = searchParams.get('product')
  
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [notes, setNotes] = useState('')
  const [deliveryPreference, setDeliveryPreference] = useState<'pickup' | 'delivery'>('pickup')
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; price: number } | null>(null)

  // Fetch accessories
  useEffect(() => {
    async function fetchAccessories() {
      try {
        const response = await fetch('/api/products?category=accessory&isActive=true&limit=50')
        if (response.ok) {
          const data = await response.json()
          setAccessories(data.products.map((p: IProduct) => ({
            _id: p._id.toString(),
            slug: p.slug,
            name: p.name,
            price: p.price,
            images: p.images,
          })))
        }
      } catch (error) {
        console.error('Error fetching accessories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccessories()
  }, [])

  // Fetch selected product if productSlug is provided
  useEffect(() => {
    async function fetchProduct() {
      if (!productSlug) return
      try {
        const response = await fetch(`/api/products/slug/${productSlug}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedProduct({ name: data.name, price: data.price })
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      }
    }

    fetchProduct()
  }, [productSlug])

  const toggleAccessory = (slug: string) => {
    setSelectedAccessories(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    )
  }

  // Get model base price (use selected product price if available, otherwise use model estimation)
  const modelBasePrice = selectedProduct?.price || (modelParam ? getVespaModelPrice(modelParam) : 0)
  
  const calculateTotal = () => {
    const accessoriesTotal = accessories
      .filter(a => selectedAccessories.includes(a.slug))
      .reduce((sum, a) => sum + a.price, 0)
    
    return modelBasePrice + accessoriesTotal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!contactInfo.name.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }
    if (!contactInfo.email.trim()) {
      toast.error('Veuillez entrer votre email')
      return
    }
    if (!contactInfo.phone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        color: colorParam,
        vespaModel: modelParam || 'Non spécifié',
        selectedProductSlug: productSlug || undefined,
        accessories: selectedAccessories.length > 0 ? selectedAccessories : undefined,
        contactInfo: {
          name: contactInfo.name.trim(),
          email: contactInfo.email.trim(),
          phone: contactInfo.phone.trim(),
          address: contactInfo.address.trim() || undefined,
        },
        deliveryPreference,
        notes: notes.trim() || undefined,
        estimatedPrice: calculateTotal() > 0 ? calculateTotal() : undefined,
      }

      console.log('Submitting payload:', payload)

      const response = await fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        
        // Show validation errors if available
        if (errorData.error && Array.isArray(errorData.error)) {
          const errorMessages = errorData.error.map((err: { path?: string[]; message?: string }) => 
            `${err.path?.join('.') || 'Field'}: ${err.message || 'Invalid'}`
          ).join(', ')
          toast.error(`Erreur de validation: ${errorMessages}`)
        } else {
          toast.error(errorData.error?.message || 'Erreur lors de la soumission')
        }
        return
      }

      await response.json()
      toast.success('Demande envoyée avec succès!')
      router.push('/personalization/success')
    } catch (error) {
      console.error('Error submitting reservation:', error)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <NavigationClientWrapper />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 pt-5">
          {/* Back Link */}
          <Link 
            href={`/personalization?color=${encodeURIComponent(colorParam)}${modelParam ? `&model=${modelParam}` : ''}`}
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à la personnalisation
          </Link>

          <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">
            Réservation
          </h1>
          <p className="text-white/60 mb-8">
            Finalisez votre configuration Vespa et ajoutez des accessoires
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Configuration Summary + Accessories */}
            <div className="lg:col-span-2 space-y-6">
              {/* Configuration Summary */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  Votre Configuration
                </h2>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Color */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div 
                      className="w-12 h-12 rounded-xl border-2 border-white/20 shrink-0"
                      style={{ backgroundColor: colorParam }}
                    />
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider">Couleur</p>
                      <p className="text-white font-mono text-sm">{colorParam}</p>
                    </div>
                  </div>

                  {/* Model */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                      <Bike className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider">Modèle</p>
                      <p className="text-white font-bold">
                        {modelParam ? `Vespa ${modelParam}` : 'Non spécifié'}
                      </p>
                      {modelBasePrice > 0 && !selectedProduct && (
                        <p className="text-amber-400 text-xs font-semibold">
                          ~{modelBasePrice.toLocaleString()} TND
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Selected Product */}
                  {selectedProduct && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider">Produit</p>
                        <p className="text-white font-bold text-sm truncate">{selectedProduct.name}</p>
                        <p className="text-amber-400 text-xs font-semibold">
                          {selectedProduct.price.toLocaleString()} TND
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Accessories */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  Accessoires Compatibles
                </h2>
                <p className="text-white/50 text-sm mb-4">
                  Sélectionnez les accessoires à ajouter à votre commande
                </p>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  </div>
                ) : accessories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {accessories.map((accessory) => {
                      const isSelected = selectedAccessories.includes(accessory.slug)
                      return (
                        <button
                          key={accessory._id}
                          type="button"
                          onClick={() => toggleAccessory(accessory.slug)}
                          className={`group relative bg-white/5 rounded-xl overflow-hidden border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-amber-400 ring-2 ring-amber-400/20' 
                              : 'border-transparent hover:border-white/20'
                          }`}
                        >
                          {/* Image */}
                          <div className="aspect-square bg-slate-800 relative">
                            {accessory.images?.[0] ? (
                              <Image
                                src={accessory.images[0]}
                                alt={accessory.name}
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

                          {/* Info */}
                          <div className="p-2">
                            <h4 className="text-white text-xs font-medium truncate">{accessory.name}</h4>
                            <p className="text-amber-400 text-sm font-bold">
                              {accessory.price.toLocaleString()} TND
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun accessoire disponible</p>
                  </div>
                )}

                {selectedAccessories.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-400/10 rounded-xl flex items-center justify-between">
                    <span className="text-white/80 text-sm">
                      {selectedAccessories.length} accessoire{selectedAccessories.length > 1 ? 's' : ''} sélectionné{selectedAccessories.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-amber-400 font-bold">
                      +{accessories.filter(a => selectedAccessories.includes(a.slug)).reduce((sum, a) => sum + a.price, 0).toLocaleString()} TND
                    </span>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Contact Form + Summary */}
            <div className="space-y-6">
              {/* Contact Form */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  Vos Coordonnées
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-white/60 mb-1.5 block">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="name"
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Votre nom"
                        className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-white/60 mb-1.5 block">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com"
                        className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium text-white/60 mb-1.5 block">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        id="phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+216 XX XXX XXX"
                        className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Delivery Preference */}
                  <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">
                      Livraison
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryPreference('pickup')}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          deliveryPreference === 'pickup'
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Retrait en magasin
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryPreference('delivery')}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          deliveryPreference === 'delivery'
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Livraison
                      </button>
                    </div>
                  </div>

                  {/* Address (if delivery) */}
                  {deliveryPreference === 'delivery' && (
                    <div>
                      <label htmlFor="address" className="text-sm font-medium text-white/60 mb-1.5 block">
                        Adresse de livraison
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                        <textarea
                          id="address"
                          value={contactInfo.address}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Votre adresse complète"
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-amber-400/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="text-sm font-medium text-white/60 mb-1.5 block">
                      Notes additionnelles
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Demandes spéciales, questions..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>

                  {/* Total & Submit */}
                  <div className="pt-4 border-t border-white/10">
                    {calculateTotal() > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/60">Total estimé</span>
                        <span className="text-2xl font-black text-amber-400">
                          {calculateTotal().toLocaleString()} TND
                        </span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-base"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer la demande
                        </>
                      )}
                    </Button>

                    <p className="text-white/40 text-xs text-center mt-3">
                      Notre équipe vous contactera dans les 24h
                    </p>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Chargement...</p>
          </div>
        </div>
      }
    >
      <ReservationContent />
    </Suspense>
  )
}

