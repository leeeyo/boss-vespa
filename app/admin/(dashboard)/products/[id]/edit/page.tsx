'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  ArrowLeft,
  Loader2,
  Package,
  ImagePlus,
  X,
  Plus,
  Bike,
  ShoppingBag,
  Star,
  Eye,
  Save,
  Trash2,
  GripVertical,
  Info,
  AlertCircle,
  Upload,
  Lock,
  Check,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

interface TechnicalSpec {
  label: string
  value: string
}

interface ProductFormData {
  name: string
  slug: string
  subtitle: string
  category: 'scooter' | 'accessory'
  color: string
  customColor: string
  type: string
  enginePower: string
  price: string
  description: string
  technicalInfo: TechnicalSpec[]
  images: string[]
  compatibility: string[]
  stock: string
  isActive: boolean
  isFeaturing: boolean
}

interface ScooterOption {
  _id: string
  name: string
  slug: string
}

// Color palette matching the personalization page
const SCOOTER_COLORS = [
  { name: 'Noir', hex: '#1a1a1a' },
  { name: 'Gris Foncé', hex: '#4a5568' },
  { name: 'Olive', hex: '#4a5d23' },
  { name: 'Vert Forêt', hex: '#2d5a27' },
  { name: 'Bleu Royal', hex: '#1e40af' },
  { name: 'Bordeaux', hex: '#7f1d1d' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Rouge Cerise', hex: '#be123c' },
  { name: 'Bleu Ciel', hex: '#3b82f6' },
  { name: 'Orange Vif', hex: '#ea580c' },
  { name: 'Ocre', hex: '#a16207' },
  { name: 'Blanc', hex: '#fafafa' },
  { name: 'Crème', hex: '#fef3c7' },
  { name: 'Rose', hex: '#f9a8d4' },
  { name: 'Jaune', hex: '#eab308' },
]

// Predefined technical characteristics
const PREDEFINED_SPECS = [
  'Moteur',
  'Couleur',
  'Roues',
  'ABS',
  'Ressort d\'amortisseur',
  'Jantes',
  'Marque',
  'Support',
  'Transmission',
  'Freins',
  'Suspension',
  'Capacité réservoir',
  'Poids',
  'Vitesse max',
  'Consommation',
  'Garantie',
  'Homologation',
  'Selle',
  'Phares',
  'Compteur',
]

export default function EditProductPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('basic')
  const [scooters, setScooters] = useState<ScooterOption[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const colorPickerRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    subtitle: '',
    category: 'scooter',
    color: '',
    customColor: '#F59E0B',
    type: '',
    enginePower: '',
    price: '',
    description: '',
    technicalInfo: [],
    images: [],
    compatibility: [],
    stock: '0',
    isActive: true,
    isFeaturing: false,
  })

  const [selectedSpecLabel, setSelectedSpecLabel] = useState('')
  const [specValue, setSpecValue] = useState('')

  // Fetch product data
  useEffect(() => {
    if (productId) {
      fetch(`/api/products/${productId}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found')
          return res.json()
        })
        .then(product => {
          // Convert color name to hex if needed
          const getHexColor = (color: string): string => {
            if (!color) return '#F59E0B'
            if (color.startsWith('#')) return color
            // Try to match color name to hex
            const colorMap: Record<string, string> = {
              'gris': '#898989',
              'Gris': '#898989',
              'noir': '#1a1a1a',
              'Noir': '#1a1a1a',
              'blanc': '#f5f5f0',
              'Blanc': '#f5f5f0',
              'rouge': '#c41e3a',
              'Rouge': '#c41e3a',
              'bleu': '#1e90ff',
              'Bleu': '#1e90ff',
              'vert': '#3d7c4a',
              'Vert': '#3d7c4a',
            }
            return colorMap[color.toLowerCase()] || colorMap[color] || color
          }
          
          const hexColor = getHexColor(product.color || '')
          
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            subtitle: product.subtitle || '',
            category: product.category || 'scooter',
            color: hexColor,
            customColor: hexColor,
            type: product.type || '',
            enginePower: product.enginePower?.toString() || '',
            price: product.price?.toString() || '',
            description: product.description || '',
            technicalInfo: product.technicalInfo || [],
            images: product.images || [],
            compatibility: product.compatibility || [],
            stock: product.stock?.toString() || '0',
            isActive: product.isActive ?? true,
            isFeaturing: product.isFeaturing ?? false,
          })
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          toast.error('Produit introuvable')
          router.push('/admin/products')
        })
    }
  }, [productId, router])

  // Fetch available scooters for compatibility selection
  useEffect(() => {
    fetch('/api/products?category=scooter&isActive=true&limit=100')
      .then(res => res.json())
      .then(data => {
        // Filter out current product if it's a scooter
        setScooters((data.products || []).filter((s: ScooterOption) => s._id !== productId))
      })
      .catch(console.error)
  }, [productId])

  // Auto-generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }, [])

  const updateField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when name changes
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value)
      }
      
      // Reset scooter-specific fields when switching to accessory
      if (field === 'category' && value === 'accessory') {
        updated.color = ''
        updated.customColor = '#F59E0B'
        updated.enginePower = ''
      }
      
      return updated
    })
  }

  const addTechnicalSpec = () => {
    if (selectedSpecLabel.trim() && specValue.trim()) {
      // Check if spec already exists
      const exists = formData.technicalInfo.some(s => s.label === selectedSpecLabel)
      if (exists) {
        toast.error('Cette caractéristique existe déjà')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        technicalInfo: [...prev.technicalInfo, { label: selectedSpecLabel, value: specValue }]
      }))
      setSelectedSpecLabel('')
      setSpecValue('')
    }
  }

  const removeTechnicalSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technicalInfo: prev.technicalInfo.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url]
        }))
      }
      toast.success('Image(s) téléchargée(s) avec succès')
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
      console.error(error)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const toggleCompatibility = (scooterSlug: string) => {
    setFormData(prev => ({
      ...prev,
      compatibility: prev.compatibility.includes(scooterSlug)
        ? prev.compatibility.filter(slug => slug !== scooterSlug)
        : [...prev.compatibility, scooterSlug]
    }))
  }

  const handleCustomColorClick = () => {
    colorPickerRef.current?.click()
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('customColor', e.target.value)
    updateField('color', e.target.value)
  }

  const selectColor = (colorHex: string) => {
    updateField('color', colorHex)
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Le nom du produit est requis'
    if (!formData.slug.trim()) return 'Le slug est requis'
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Le prix doit être supérieur à 0'
    if (formData.category === 'scooter' && !formData.enginePower) return 'La puissance du moteur est requise pour les scooters'
    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    setSaving(true)

    try {
      // Validate and parse numeric values
      const parsedPrice = parseFloat(formData.price)
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error('Le prix doit être un nombre valide supérieur à 0')
      }

      const parsedStock = parseInt(formData.stock) || 0
      if (isNaN(parsedStock) || parsedStock < 0) {
        throw new Error('Le stock doit être un nombre valide supérieur ou égal à 0')
      }

      let parsedEnginePower: number | undefined = undefined
      if (formData.category === 'scooter' && formData.enginePower) {
        parsedEnginePower = parseInt(formData.enginePower)
        if (isNaN(parsedEnginePower) || parsedEnginePower <= 0) {
          throw new Error('La puissance du moteur doit être un nombre valide supérieur à 0')
        }
      }

      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        subtitle: formData.subtitle || undefined,
        category: formData.category,
        type: formData.type || undefined,
        description: formData.description || undefined,
        technicalInfo: formData.technicalInfo.length > 0 ? formData.technicalInfo : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        isActive: formData.isActive,
        isFeaturing: formData.isFeaturing,
        price: parsedPrice,
        stock: parsedStock,
      }

      // Only include scooter-specific fields if category is scooter
      if (formData.category === 'scooter') {
        if (parsedEnginePower) {
          payload.enginePower = parsedEnginePower
        }
        if (formData.color) {
          payload.color = formData.color
        }
      }

      // Only include accessory-specific fields if category is accessory
      if (formData.category === 'accessory' && formData.compatibility && formData.compatibility.length > 0) {
        payload.compatibility = formData.compatibility
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        // Handle both string errors and error arrays
        const errorMessage = Array.isArray(data.error) 
          ? data.error.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message || e}`).join(', ')
          : typeof data.error === 'string'
          ? data.error
          : data.error?.message || JSON.stringify(data.error) || 'Erreur lors de la mise à jour'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Show notification if slug was auto-modified
      if (data.slugModified) {
        toast.success(`Produit mis à jour avec succès! Le slug a été modifié en "${data.slug}" car "${data.originalSlug}" existait déjà.`)
      } else {
        toast.success('Produit mis à jour avec succès!')
      }
      
      router.push('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du produit')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Produit supprimé avec succès!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression du produit')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleToggleActive = async () => {
    const newIsActive = !formData.isActive
    updateField('isActive', newIsActive)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(newIsActive ? 'Produit activé' : 'Produit désactivé')
    } catch (err) {
      // Revert on error
      updateField('isActive', !newIsActive)
      toast.error('Erreur lors du changement de statut')
      console.error(err)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" aria-label="Chargement" />
      </div>
    )
  }

  const sections = [
    { id: 'basic', label: 'Informations', icon: Package },
    { id: 'media', label: 'Médias', icon: ImagePlus },
    { id: 'specs', label: 'Caractéristiques', icon: Info },
    { id: 'settings', label: 'Paramètres', icon: Eye },
  ]

  // Get available specs (not yet added)
  const availableSpecs = PREDEFINED_SPECS.filter(
    spec => !formData.technicalInfo.some(s => s.label === spec)
  )

  return (
    <div className="min-h-screen pb-32 lg:pb-8">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Supprimer ce produit ?</h3>
                <p className="text-white/60 text-sm">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-bold text-white">{formData.name}</span> ? 
              Cette action ne peut pas être annulée.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 lg:py-8 text-white">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Link 
            href="/admin/products" 
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
            aria-label="Retour au catalogue"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au catalogue
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Modifier le Produit
              </h1>
              <p className="text-white/50 mt-2">Modifiez les informations de {formData.name || 'ce produit'}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleToggleActive}
                className={`border-white/10 ${formData.isActive ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'}`}
              >
                {formData.isActive ? (
                  <>
                    <Eye size={18} className="mr-2" />
                    Actif
                  </>
                ) : (
                  <>
                    <Eye size={18} className="mr-2" />
                    Inactif
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-white/10 bg-white/5 text-rose-400 hover:bg-rose-500/20"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Section Navigation - Only visible on mobile */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all shrink-0 ${
                activeSection === section.id 
                  ? 'bg-amber-400 text-slate-900' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <section.icon size={16} aria-hidden="true" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Main Form Area - All sections visible on desktop */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Information Section */}
          <Card className={`bg-white/5 border-white/10 p-5 lg:p-6 ${activeSection !== 'basic' ? 'hidden lg:block' : ''}`}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                <Package size={20} aria-hidden="true" />
              </div>
              Informations de base
            </h2>

            <div className="space-y-5">
              {/* Category Selection */}
              <div>
                <label className="text-sm font-bold text-white/60 mb-3 block">Catégorie *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateField('category', 'scooter')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      formData.category === 'scooter'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                    aria-pressed={formData.category === 'scooter'}
                  >
                    <Bike size={32} aria-hidden="true" />
                    <span className="font-bold">Scooter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('category', 'accessory')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      formData.category === 'accessory'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                    aria-pressed={formData.category === 'accessory'}
                  >
                    <ShoppingBag size={32} aria-hidden="true" />
                    <span className="font-bold">Accessoire</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="text-sm font-bold text-white/60 mb-2 block">
                  Nom du produit *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="ex: Vespa Primavera 125"
                  className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                />
              </div>

              {/* Slug - Locked */}
              <div>
                <label htmlFor="slug" className="text-sm font-bold text-white/60 mb-2 flex items-center gap-2">
                  Slug (URL)
                  <Lock size={12} className="text-white/40" aria-hidden="true" />
                </label>
                <div className="relative">
                  <Input
                    id="slug"
                    value={formData.slug}
                    readOnly
                    disabled
                    placeholder="vespa-primavera-125"
                    className="bg-white/5 border-white/10 h-12 text-white/50 font-mono placeholder:text-white/30 cursor-not-allowed pr-10"
                  />
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" aria-hidden="true" />
                </div>
                <p className="text-xs text-white/40 mt-1">Généré automatiquement à partir du nom</p>
              </div>

              {/* Subtitle */}
              <div>
                <label htmlFor="subtitle" className="text-sm font-bold text-white/60 mb-2 block">
                  Sous-titre
                </label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="ex: La légendaire italienne"
                  className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                />
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="text-sm font-bold text-white/60 mb-2 block">
                    Prix (TND) *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="bg-white/5 border-white/10 h-12 text-white font-mono placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="text-sm font-bold text-white/60 mb-2 block">
                    Stock
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="bg-white/5 border-white/10 h-12 text-white font-mono placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
              </div>

              {/* Engine Power (Scooter only) - Free text input */}
              {formData.category === 'scooter' && (
                <div>
                  <label htmlFor="enginePower" className="text-sm font-bold text-white/60 mb-2 block">
                    Puissance moteur (cc) *
                  </label>
                  <Input
                    id="enginePower"
                    type="number"
                    value={formData.enginePower}
                    onChange={(e) => updateField('enginePower', e.target.value)}
                    placeholder="ex: 125, 150, 300..."
                    min="0"
                    className="bg-white/5 border-white/10 h-12 text-white font-mono placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
              )}

              {/* Color (Scooter only) - Circular color picker like personalization page */}
              {formData.category === 'scooter' && (
                <div>
                  <label className="text-sm font-bold text-white/60 mb-3 block">Couleur</label>
                  
                  {/* Hidden color picker input */}
                  <input
                    ref={colorPickerRef}
                    type="color"
                    value={formData.customColor}
                    onChange={handleCustomColorChange}
                    className="hidden"
                    aria-label="Sélectionner une couleur personnalisée"
                  />
                  
                  {/* Color Grid - Circular buttons like the screenshot */}
                  <div className="flex flex-wrap gap-3">
                    {/* Custom Color Button (Plus) */}
                    <button
                      type="button"
                      onClick={handleCustomColorClick}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                        formData.color === formData.customColor && !SCOOTER_COLORS.some(c => c.hex === formData.color)
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{ 
                        background: `conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)` 
                      }}
                      title="Couleur personnalisée"
                      aria-label="Sélectionner une couleur personnalisée"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                        <Plus size={16} className="text-white" />
                      </div>
                    </button>

                    {/* Predefined Colors */}
                    {SCOOTER_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => selectColor(c.hex)}
                        className={`w-12 h-12 rounded-full border-2 transition-all relative ${
                          formData.color === c.hex
                            ? 'border-white ring-2 ring-white/30 scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={`Sélectionner ${c.name}`}
                        aria-pressed={formData.color === c.hex}
                      >
                        {formData.color === c.hex && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check size={16} className={c.hex === '#fafafa' || c.hex === '#fef3c7' || c.hex === '#eab308' ? 'text-slate-900' : 'text-white'} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected color preview */}
                  {formData.color && (
                    <div className="mt-4 flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg border border-white/20"
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="text-sm text-white/60">
                        Couleur sélectionnée: <span className="font-mono text-amber-400">{formData.color}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="description" className="text-sm font-bold text-white/60 mb-2 block">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Décrivez le produit..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Media Section */}
          <Card className={`bg-white/5 border-white/10 p-5 lg:p-6 ${activeSection !== 'media' ? 'hidden lg:block' : ''}`}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400">
                <ImagePlus size={20} aria-hidden="true" />
              </div>
              Images du produit
            </h2>

            {/* Image Upload */}
            <div className="mb-4">
              <label 
                htmlFor="imageUpload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  uploading 
                    ? 'border-amber-400/50 bg-amber-400/5' 
                    : 'border-white/20 hover:border-amber-400/50 hover:bg-white/5'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-white/60">Téléchargement en cours...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white/40 mb-2" aria-hidden="true" />
                    <span className="text-white/60 text-sm font-bold">Cliquez pour télécharger</span>
                    <span className="text-white/30 text-xs mt-1">PNG, JPG, WEBP jusqu&apos;à 10MB</span>
                  </>
                )}
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Grid */}
            {formData.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 group">
                    <Image src={img} alt={`Image ${index + 1}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-400"
                      aria-label={`Supprimer image ${index + 1}`}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-amber-400 text-slate-900 rounded-md text-xs font-bold">
                        Principale
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2 p-1.5 bg-white/20 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical size={14} className="text-white" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                <ImagePlus className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                <p>Aucune image téléchargée</p>
              </div>
            )}
          </Card>

          {/* Technical Specs Section */}
          <Card className={`bg-white/5 border-white/10 p-5 lg:p-6 ${activeSection !== 'specs' ? 'hidden lg:block' : ''}`}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400">
                <Info size={20} aria-hidden="true" />
              </div>
              Caractéristiques techniques
            </h2>

            {/* Add Spec Form with Predefined Labels */}
            <div className="space-y-4 mb-6">
              {/* Predefined Spec Selector */}
              <div>
                <label className="text-sm font-bold text-white/60 mb-2 block">
                  Caractéristique
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSpecs.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecLabel(spec)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedSpecLabel === spec
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Input - Shows when a spec is selected */}
              {selectedSpecLabel && (
                <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex-1">
                    <label className="text-sm font-bold text-white/60 mb-2 block">
                      Valeur pour &quot;{selectedSpecLabel}&quot;
                    </label>
                    <Input
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder={`ex: ${selectedSpecLabel === 'Moteur' ? '125cc' : selectedSpecLabel === 'ABS' ? 'Oui' : '...'}`}
                      className="bg-white/5 border-white/10 h-12 text-white placeholder:text-white/30 focus:border-amber-400/50"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSpec())}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={addTechnicalSpec}
                      disabled={!specValue.trim()}
                      className="bg-blue-500 hover:bg-blue-400 text-white h-12 px-5 disabled:opacity-50"
                      aria-label="Ajouter la caractéristique"
                    >
                      <Plus size={20} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Specs List */}
            {formData.technicalInfo.length > 0 ? (
              <div className="space-y-2">
                {formData.technicalInfo.map((spec, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripVertical size={16} className="text-white/20 shrink-0 cursor-grab" aria-hidden="true" />
                      <span className="font-bold text-white truncate">{spec.label}</span>
                      <span className="text-white/40">:</span>
                      <span className="text-white/70 truncate">{spec.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTechnicalSpec(index)}
                      className="p-2 text-white/40 hover:text-rose-400 transition-colors shrink-0"
                      aria-label={`Supprimer ${spec.label}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
                <Info className="w-10 h-10 text-white/20 mx-auto mb-2" aria-hidden="true" />
                <p className="text-white/40">Sélectionnez une caractéristique ci-dessus pour commencer</p>
              </div>
            )}

            {/* Compatibility (Accessories only) - Multi-select from available scooters */}
            {formData.category === 'accessory' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Compatibilité avec les scooters</h3>
                <p className="text-white/40 text-sm mb-4">
                  Sélectionnez les scooters compatibles avec cet accessoire
                </p>
                
                {scooters.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                    {scooters.map((scooter) => {
                      const isSelected = formData.compatibility.includes(scooter.slug)
                      return (
                        <button
                          key={scooter._id}
                          type="button"
                          onClick={() => toggleCompatibility(scooter.slug)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                            isSelected
                              ? 'bg-purple-500/20 border-2 border-purple-400/50 text-purple-300'
                              : 'bg-white/5 border-2 border-transparent hover:bg-white/10 text-white/70'
                          }`}
                          aria-pressed={isSelected}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-500 text-white' : 'bg-white/10'
                          }`}>
                            {isSelected && <Check size={14} aria-hidden="true" />}
                          </div>
                          <span className="truncate font-medium">{scooter.name}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white/5 rounded-xl">
                    <Bike className="w-10 h-10 text-white/20 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-white/40">Aucun scooter disponible</p>
                  </div>
                )}

                {formData.compatibility.length > 0 && (
                  <p className="text-sm text-purple-400 mt-4">
                    {formData.compatibility.length} scooter{formData.compatibility.length > 1 ? 's' : ''} sélectionné{formData.compatibility.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Settings Section */}
          <Card className={`bg-white/5 border-white/10 p-5 lg:p-6 ${activeSection !== 'settings' ? 'hidden lg:block' : ''}`}>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
                <Eye size={20} aria-hidden="true" />
              </div>
              Paramètres de publication
            </h2>

            <div className="space-y-4">
              {/* Active Toggle */}
              <button
                type="button"
                onClick={() => updateField('isActive', !formData.isActive)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  formData.isActive 
                    ? 'border-emerald-400/50 bg-emerald-400/10' 
                    : 'border-white/10 bg-white/5'
                }`}
                aria-pressed={formData.isActive}
              >
                <div className="flex items-center gap-3">
                  <Eye size={20} className={formData.isActive ? 'text-emerald-400' : 'text-white/40'} aria-hidden="true" />
                  <div className="text-left">
                    <p className="font-bold text-white">Produit actif</p>
                    <p className="text-sm text-white/40">Visible dans la boutique</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.isActive ? 'bg-emerald-400' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>

              {/* Featured Toggle */}
              <button
                type="button"
                onClick={() => updateField('isFeaturing', !formData.isFeaturing)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  formData.isFeaturing 
                    ? 'border-amber-400/50 bg-amber-400/10' 
                    : 'border-white/10 bg-white/5'
                }`}
                aria-pressed={formData.isFeaturing}
              >
                <div className="flex items-center gap-3">
                  <Star size={20} className={formData.isFeaturing ? 'text-amber-400' : 'text-white/40'} aria-hidden="true" />
                  <div className="text-left">
                    <p className="font-bold text-white">Produit vedette</p>
                    <p className="text-sm text-white/40">Afficher sur la page d&apos;accueil</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.isFeaturing ? 'bg-amber-400' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.isFeaturing ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            {/* Validation Summary */}
            {validateForm() && (
              <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={20} aria-hidden="true" />
                <div>
                  <p className="font-bold text-rose-400">Champs requis manquants</p>
                  <p className="text-sm text-rose-300/80">{validateForm()}</p>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Zone de danger
              </h3>
              <p className="text-white/40 text-sm mb-4">
                Supprimer ce produit de façon permanente. Cette action est irréversible.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50"
              >
                <Trash2 size={18} className="mr-2" />
                Supprimer ce produit
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Action Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 lg:hidden z-50">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-14 border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !!validateForm()}
            className="flex-1 h-14 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-label="Enregistrement en cours" />
            ) : (
              <>
                <Save size={20} className="mr-2" aria-hidden="true" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Action Bar */}
      <div className="hidden lg:block fixed bottom-8 right-8">
        <div className="flex gap-3 p-2 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-12 px-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !!validateForm()}
            className="h-12 px-8 bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-label="Enregistrement en cours" />
            ) : (
              <>
                <Save size={20} className="mr-2" aria-hidden="true" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

