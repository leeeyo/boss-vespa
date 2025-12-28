'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Loader2,
  Palette,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Hash,
  Bike,
  ShoppingBag,
  Package,
  Truck,
  Store,
  MessageSquare,
  XCircle,
  FileText,
  Save
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
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
  address?: string
}

interface Personalization {
  _id: string
  color: string
  vespaModel: string
  type?: string
  enginePower?: number
  selectedProductSlug?: string
  accessories: string[]
  contactInfo: ContactInfo
  deliveryPreference: 'pickup' | 'delivery'
  notes?: string
  status: 'pending' | 'contacted' | 'quoted' | 'approved' | 'rejected' | 'completed'
  adminNotes?: string
  estimatedPrice?: number
  finalPrice?: number
  createdAt: string
  updatedAt: string
}

interface Product {
  _id: string
  name: string
  price: number
  images: string[]
  slug: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    bgColor: 'bg-amber-400',
    icon: Clock,
  },
  contacted: {
    label: 'Contacté',
    color: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    bgColor: 'bg-blue-400',
    icon: Phone,
  },
  quoted: {
    label: 'Devis envoyé',
    color: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    bgColor: 'bg-purple-400',
    icon: FileText,
  },
  approved: {
    label: 'Approuvée',
    color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    bgColor: 'bg-emerald-400',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Refusée',
    color: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    bgColor: 'bg-rose-400',
    icon: XCircle,
  },
  completed: {
    label: 'Terminée',
    color: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
    bgColor: 'bg-teal-400',
    icon: CheckCircle2,
  },
}

export default function AdminPersonalizationDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const personalizationId = params.id as string

  const [personalization, setPersonalization] = useState<Personalization | null>(null)
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [finalPrice, setFinalPrice] = useState<string>('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [authStatus, router])

  const fetchAccessories = useCallback(async (slugs: string[]) => {
    try {
      // Fetch each accessory by slug
      const accessoryPromises = slugs.map(async (slug) => {
        const res = await fetch(`/api/products/slug/${slug}`)
        if (res.ok) {
          return res.json()
        }
        return null
      })
      const results = await Promise.all(accessoryPromises)
      setAccessories(results.filter(Boolean))
    } catch (error) {
      console.error('Error fetching accessories:', error)
    }
  }, [])

  const fetchProduct = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/products/slug/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }, [])

  const fetchPersonalization = useCallback(async () => {
    try {
      const res = await fetch(`/api/personalization/${personalizationId}`)
      if (!res.ok) throw new Error('Personalization not found')
      const data = await res.json()
      setPersonalization(data)
      setAdminNotes(data.adminNotes || '')
      setFinalPrice(data.finalPrice?.toString() || '')
      
      // Fetch accessories details if any
      if (data.accessories && data.accessories.length > 0) {
        fetchAccessories(data.accessories)
      }
      
      // Fetch selected product if any
      if (data.selectedProductSlug) {
        fetchProduct(data.selectedProductSlug)
      }
    } catch {
      toast.error('Demande non trouvée')
      router.push('/admin/personalizations')
    } finally {
      setLoading(false)
    }
  }, [personalizationId, router, fetchAccessories, fetchProduct])

  useEffect(() => {
    if (session?.user?.role === 'admin' && personalizationId) {
      fetchPersonalization()
    }
  }, [session, personalizationId, fetchPersonalization])

  const updateStatus = async (newStatus: string) => {
    if (!personalization) return
    setUpdating(true)
    
    try {
      const res = await fetch(`/api/personalization/${personalizationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')
      
      const updatedPersonalization = await res.json()
      setPersonalization(updatedPersonalization)
      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label}`)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  const saveAdminNotes = async () => {
    if (!personalization) return
    setUpdating(true)
    
    try {
      const res = await fetch(`/api/personalization/${personalizationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminNotes,
          finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')
      
      const updatedPersonalization = await res.json()
      setPersonalization(updatedPersonalization)
      toast.success('Notes sauvegardées')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setUpdating(false)
    }
  }

  // Calculate accessories total
  const accessoriesTotal = accessories.reduce((sum, acc) => sum + acc.price, 0)
  
  // Get estimated model price
  const modelEstimatedPrice = personalization ? getVespaModelPrice(personalization.vespaModel) : 0

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  if (!personalization) return null

  const StatusIcon = STATUS_CONFIG[personalization.status].icon

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <Link 
            href="/admin/personalizations" 
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour aux personnalisations
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl lg:text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Demande de Personnalisation
            </h1>
            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${STATUS_CONFIG[personalization.status].color}`}>
              <StatusIcon size={14} />
              {STATUS_CONFIG[personalization.status].label}
            </div>
          </div>
          <p className="text-white/40 mt-2">
            Créée le {new Date(personalization.createdAt).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Configuration Summary */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 rounded-lg">
                  <Palette className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Configuration Choisie</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Color */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div 
                    className="w-16 h-16 rounded-xl border-2 border-white/20 shrink-0 shadow-lg"
                    style={{ backgroundColor: personalization.color }}
                  />
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Couleur</p>
                    <p className="text-white font-mono text-lg font-bold">{personalization.color}</p>
                  </div>
                </div>

                {/* Model */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                    <Bike className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Modèle</p>
                    <p className="text-white font-bold text-lg">
                      Vespa {personalization.vespaModel}
                    </p>
                  </div>
                </div>

                {/* Delivery Preference */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
                    {personalization.deliveryPreference === 'delivery' ? (
                      <Truck className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <Store className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Livraison</p>
                    <p className="text-white font-bold text-lg">
                      {personalization.deliveryPreference === 'delivery' ? 'À domicile' : 'Retrait magasin'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Product */}
          {selectedProduct && (
            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-400/10 rounded-lg">
                    <Package className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Produit Sélectionné</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0">
                    {selectedProduct.images?.[0] ? (
                      <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
                    <p className="text-amber-400 font-bold text-2xl mt-1">
                      {selectedProduct.price.toLocaleString()} TND
                    </p>
                  </div>
                  <Link href={`/admin/products/${selectedProduct._id}/edit`}>
                    <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                      Voir le produit →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Accessories */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Accessoires</h2>
                <span className="ml-auto text-sm text-white/40">
                  {personalization.accessories.length} accessoire(s)
                </span>
              </div>
            </div>
            {accessories.length > 0 ? (
              <>
                <div className="divide-y divide-white/5">
                  {accessories.map((accessory) => (
                    <div key={accessory._id} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-colors">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        {accessory.images?.[0] ? (
                          <Image
                            src={accessory.images[0]}
                            alt={accessory.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{accessory.name}</h3>
                        <p className="text-white/40 text-sm">{accessory.slug}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">{accessory.price.toLocaleString()} TND</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-white/5 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total accessoires:</span>
                    <span className="text-xl font-bold text-amber-400">{accessoriesTotal.toLocaleString()} TND</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/40">Aucun accessoire sélectionné</p>
              </div>
            )}
          </Card>

          {/* Client Notes */}
          {personalization.notes && (
            <Card className="bg-white/5 border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-400/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Notes du Client</h2>
              </div>
              <p className="text-white/70 whitespace-pre-wrap bg-white/5 rounded-xl p-4">
                {personalization.notes}
              </p>
            </Card>
          )}

          {/* Price Summary */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <Hash className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Résumé Financier</h2>
            </div>
            <div className="space-y-3">
              {/* Model estimated price (if no specific product selected) */}
              {!selectedProduct && modelEstimatedPrice > 0 && (
                <div className="flex justify-between text-white/60">
                  <span>Vespa {personalization.vespaModel} (estimé):</span>
                  <span className="font-mono">~{modelEstimatedPrice.toLocaleString()} TND</span>
                </div>
              )}
              {selectedProduct && (
                <div className="flex justify-between text-white/60">
                  <span>Produit sélectionné:</span>
                  <span className="font-mono">{selectedProduct.price.toLocaleString()} TND</span>
                </div>
              )}
              {accessoriesTotal > 0 && (
                <div className="flex justify-between text-white/60">
                  <span>Accessoires:</span>
                  <span className="font-mono">{accessoriesTotal.toLocaleString()} TND</span>
                </div>
              )}
              {personalization.estimatedPrice && (
                <div className="flex justify-between text-white/60">
                  <span>Prix estimé (client):</span>
                  <span className="font-mono">{personalization.estimatedPrice.toLocaleString()} TND</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total calculé:</span>
                  <span className="text-2xl font-black text-amber-400">
                    {((selectedProduct?.price || modelEstimatedPrice) + accessoriesTotal).toLocaleString()} TND
                  </span>
                </div>
              </div>
              {personalization.finalPrice && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/60">Prix final (admin):</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {personalization.finalPrice.toLocaleString()} TND
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Gestion du statut</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2 block">
                  Statut de la demande
                </label>
                <Select
                  value={personalization.status}
                  onValueChange={updateStatus}
                  disabled={updating}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem 
                          key={key} 
                          value={key}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} className={config.color.split(' ')[1]} />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-400/10 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Client</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-white/40" />
                <span className="text-white font-bold">{personalization.contactInfo.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-white/40" />
                <a 
                  href={`mailto:${personalization.contactInfo.email}`} 
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {personalization.contactInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-white/40" />
                <a 
                  href={`tel:${personalization.contactInfo.phone}`} 
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {personalization.contactInfo.phone}
                </a>
              </div>
              {personalization.contactInfo.address && (
                <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                  <MapPin size={16} className="text-white/40 mt-0.5" />
                  <span className="text-white/70">{personalization.contactInfo.address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-400/10 rounded-lg">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Actions rapides</h2>
            </div>
            
            <div className="space-y-3">
              <a 
                href={`mailto:${personalization.contactInfo.email}?subject=Votre demande de personnalisation Vespa`}
                className="w-full"
              >
                <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 justify-start">
                  <Mail size={16} className="mr-2" />
                  Envoyer un email
                </Button>
              </a>
              <a 
                href={`tel:${personalization.contactInfo.phone}`}
                className="w-full"
              >
                <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 justify-start">
                  <Phone size={16} className="mr-2" />
                  Appeler le client
                </Button>
              </a>
            </div>
          </Card>

          {/* Admin Notes */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-400/10 rounded-lg">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Notes Admin</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2 block">
                  Prix final proposé (TND)
                </label>
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="Ex: 15000"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2 block">
                  Notes internes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes visibles uniquement par l'admin..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                />
              </div>
              <Button 
                onClick={saveAdminNotes}
                disabled={updating}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </Card>

          {/* Details */}
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Calendar className="w-5 h-5 text-white/60" />
              </div>
              <h2 className="text-lg font-bold text-white">Détails</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">ID:</span>
                <span className="font-mono text-white text-xs">{personalization._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Créée le:</span>
                <span className="text-white">
                  {new Date(personalization.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Mise à jour:</span>
                <span className="text-white">
                  {new Date(personalization.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

