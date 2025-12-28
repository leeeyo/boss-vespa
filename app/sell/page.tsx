'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bike,
  Calendar,
  Palette,
  Gauge,
  BadgeCheck,
  FileText,
  Banknote,
  ImagePlus,
  X,
  Loader2,
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// Popular scooter brands
const SCOOTER_BRANDS = [
  'Vespa',
  'Piaggio',
  'Liberty',
  'Gilera',
  'Honda',
  'Yamaha',
  'Suzuki',
  'Sym',
  'Kymco',
  'Aprilia',
  'Peugeot',
  'MBK',
  'Autre',
]

// Tunisian cities
const TUNISIAN_CITIES = [
  'Tunis',
  'Sfax',
  'Sousse',
  'Kairouan',
  'Bizerte',
  'Gabès',
  'Ariana',
  'Gafsa',
  'Monastir',
  'Ben Arous',
  'Kasserine',
  'Médenine',
  'Nabeul',
  'Tataouine',
  'Béja',
  'Jendouba',
  'Mahdia',
  'Sidi Bouzid',
  'Le Kef',
  'Tozeur',
  'Siliana',
  'Kébili',
  'Zaghouan',
  'Manouba',
]

// Condition options
const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent', description: 'Comme neuf, aucun défaut' },
  { value: 'good', label: 'Bon', description: 'Bien entretenu, défauts mineurs' },
  { value: 'fair', label: 'Correct', description: 'Usure normale, fonctionne bien' },
  { value: 'poor', label: 'À réviser', description: 'Nécessite des réparations' },
]

// Generate year options (last 30 years)
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => currentYear - i)

interface FormData {
  // Contact
  name: string
  email: string
  phone: string
  location: string
  // Scooter
  brand: string
  customBrand: string
  scooterModel: string
  year: number | ''
  color: string
  // Condition
  mileage: number | ''
  condition: 'excellent' | 'good' | 'fair' | 'poor' | ''
  // Details
  description: string
  askingPrice: number | ''
  images: string[]
}

export default function SellPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    brand: '',
    customBrand: '',
    scooterModel: '',
    year: '',
    color: '',
    mileage: '',
    condition: '',
    description: '',
    askingPrice: '',
    images: [],
  })

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max images
    if (formData.images.length + files.length > 10) {
      toast.error('Maximum 10 photos autorisées')
      return
    }

    setUploadingImages(true)
    const newImages: string[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`)
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} dépasse la limite de 10MB`)
          continue
        }

        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const response = await fetch('/api/scooter-listings/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (response.ok) {
          const data = await response.json()
          newImages.push(data.url)
        } else {
          toast.error(`Erreur lors de l'upload de ${file.name}`)
        }
      }

      if (newImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }))
        toast.success(`${newImages.length} photo${newImages.length > 1 ? 's' : ''} ajoutée${newImages.length > 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploadingImages(false)
      // Reset input
      e.target.value = ''
    }
  }, [formData.images.length])

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Veuillez entrer votre email')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone')
      return
    }
    if (!formData.location) {
      toast.error('Veuillez sélectionner votre ville')
      return
    }
    if (!formData.brand) {
      toast.error('Veuillez sélectionner la marque')
      return
    }
    if (formData.brand === 'Autre' && !formData.customBrand.trim()) {
      toast.error('Veuillez préciser la marque')
      return
    }
    if (!formData.scooterModel.trim()) {
      toast.error('Veuillez entrer le modèle')
      return
    }
    if (!formData.year) {
      toast.error('Veuillez sélectionner l\'année')
      return
    }
    if (!formData.color.trim()) {
      toast.error('Veuillez entrer la couleur')
      return
    }
    if (formData.mileage === '' || formData.mileage < 0) {
      toast.error('Veuillez entrer le kilométrage')
      return
    }
    if (!formData.condition) {
      toast.error('Veuillez sélectionner l\'état du scooter')
      return
    }
    if (formData.askingPrice === '' || formData.askingPrice <= 0) {
      toast.error('Veuillez entrer votre prix demandé')
      return
    }
    if (formData.images.length === 0) {
      toast.error('Veuillez ajouter au moins une photo')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location,
        brand: formData.brand === 'Autre' ? formData.customBrand.trim() : formData.brand,
        scooterModel: formData.scooterModel.trim(),
        year: formData.year,
        color: formData.color.trim(),
        mileage: formData.mileage,
        condition: formData.condition,
        description: formData.description.trim() || undefined,
        askingPrice: formData.askingPrice,
        images: formData.images,
      }

      const response = await fetch('/api/scooter-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        toast.error('Erreur lors de la soumission. Veuillez réessayer.')
        return
      }

      toast.success('Votre annonce a été soumise avec succès!')
      router.push('/sell/success')
    } catch (error) {
      console.error('Error submitting:', error)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <NavigationClientWrapper />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 pt-5">
          {/* Header */}
          <div className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Banknote size={14} />
              Rachat de scooters
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-emerald-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              Vendez votre scooter
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              Remplissez ce formulaire pour nous proposer votre scooter. Notre équipe vous contactera rapidement avec une offre.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            {/* Section 1: Contact Info */}
            <Card className="bg-white/5 border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Vos coordonnées</h2>
                  <p className="text-white/40 text-sm">Comment vous contacter</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Nom complet *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Votre nom"
                      className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="votre@email.com"
                      className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+216 XX XXX XXX"
                      className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Ville *</label>
                  <Select value={formData.location} onValueChange={(v) => updateField('location', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white">
                      <MapPin className="w-4 h-4 text-white/30 mr-2" />
                      <SelectValue placeholder="Sélectionnez votre ville" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {TUNISIAN_CITIES.sort().map((city) => (
                        <SelectItem key={city} value={city} className="text-white focus:bg-white/10 focus:text-white">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Section 2: Scooter Details */}
            <Card className="bg-white/5 border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <Bike className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Votre scooter</h2>
                  <p className="text-white/40 text-sm">Informations sur le véhicule</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Brand */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Marque *</label>
                  <Select value={formData.brand} onValueChange={(v) => updateField('brand', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white">
                      <SelectValue placeholder="Sélectionnez la marque" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {SCOOTER_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand} className="text-white focus:bg-white/10 focus:text-white">
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.brand === 'Autre' && (
                    <Input
                      value={formData.customBrand}
                      onChange={(e) => updateField('customBrand', e.target.value)}
                      placeholder="Précisez la marque..."
                      className="bg-white/5 border-white/10 h-11 text-white placeholder:text-white/30 mt-2"
                    />
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Modèle *</label>
                  <Input
                    value={formData.scooterModel}
                    onChange={(e) => updateField('scooterModel', e.target.value)}
                    placeholder="Ex: Primavera 125, PCX 150..."
                    className="bg-white/5 border-white/10 h-11 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Année *</label>
                  <Select 
                    value={formData.year.toString()} 
                    onValueChange={(v) => updateField('year', parseInt(v))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 text-white">
                      <Calendar className="w-4 h-4 text-white/30 mr-2" />
                      <SelectValue placeholder="Année de fabrication" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-60">
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year} value={year.toString()} className="text-white focus:bg-white/10 focus:text-white">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Couleur *</label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      value={formData.color}
                      onChange={(e) => updateField('color', e.target.value)}
                      placeholder="Ex: Rouge, Bleu métallisé..."
                      className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 3: Condition */}
            <Card className="bg-white/5 border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">État du véhicule</h2>
                  <p className="text-white/40 text-sm">Kilométrage et condition générale</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Mileage */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Kilométrage (km) *</label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="number"
                      min="0"
                      value={formData.mileage}
                      onChange={(e) => updateField('mileage', e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="Ex: 15000"
                      className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-3 block">État général *</label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {CONDITION_OPTIONS.map((option) => {
                      const isSelected = formData.condition === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField('condition', option.value as typeof formData.condition)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-400/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                              {option.label}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs">{option.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 4: Price & Description */}
            <Card className="bg-white/5 border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Prix et description</h2>
                  <p className="text-white/40 text-sm">Votre prix demandé et détails supplémentaires</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Asking Price */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Prix demandé (TND) *</label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="number"
                      min="0"
                      value={formData.askingPrice}
                      onChange={(e) => updateField('askingPrice', e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="Ex: 8500"
                      className="bg-white/5 border-white/10 pl-10 h-11 text-white placeholder:text-white/30"
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-1.5">
                    Indiquez le prix que vous souhaitez obtenir pour votre scooter
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-white/60 mb-1.5 block">Description (optionnel)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Décrivez votre scooter : historique d'entretien, options, accessoires inclus, raison de la vente..."
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Section 5: Photos */}
            <Card className="bg-white/5 border-white/10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <ImagePlus className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Photos du scooter *</h2>
                  <p className="text-white/40 text-sm">Ajoutez jusqu&apos;à 10 photos (min. 1 requise)</p>
                </div>
              </div>

              {/* Upload Area */}
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400/50 hover:bg-purple-400/5 transition-all cursor-pointer">
                    {uploadingImages ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                        <p className="text-white/60">Upload en cours...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">Cliquez pour ajouter des photos</p>
                        <p className="text-white/40 text-sm">PNG, JPG ou WEBP jusqu&apos;à 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>

                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                        <Image
                          src={url}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-amber-400 text-black text-[10px] font-bold uppercase">
                            Principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Photo tips */}
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/60 text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Conseils pour de bonnes photos :
                  </p>
                  <ul className="text-white/40 text-xs space-y-1 ml-6 list-disc">
                    <li>Photo générale du scooter (face avant)</li>
                    <li>Vue de profil gauche et droite</li>
                    <li>Compteur kilométrique</li>
                    <li>Défauts ou rayures éventuels</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || uploadingImages}
                className="w-full h-14 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.4)] transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Soumettre mon annonce
                  </span>
                )}
              </Button>
              <p className="text-white/30 text-center text-sm mt-4">
                Notre équipe examinera votre annonce et vous contactera sous 48h.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

