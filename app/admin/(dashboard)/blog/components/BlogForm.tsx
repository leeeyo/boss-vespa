'use client'

import { useState, useCallback} from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Image as ImageIcon,
  Settings,
  Info,
  Lock,
  Upload,
  X,
  Plus,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-[400px] bg-white/5 rounded-xl animate-pulse" /> }
)

interface BlogFormData {
  slug: string
  title: string
  description: string
  content: string
  image: string
  category: string
  tags: string[]
  author: {
    name: string
    role: string
  }
  isPublished: boolean
}

interface BlogFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<BlogFormData>
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: 'Actualités', label: 'Actualités' },
  { value: 'Guides', label: 'Guides' },
  { value: 'Entretien', label: 'Entretien' },
  { value: 'Lifestyle', label: 'Lifestyle' },
]

const SECTIONS = [
  { id: 'basic', label: 'Infos de base', icon: Info },
  { id: 'content', label: 'Contenu', icon: FileText },
  { id: 'media', label: 'Média', icon: ImageIcon },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

export function BlogForm({ mode, initialData, onSuccess }: BlogFormProps) {
  const [activeSection, setActiveSection] = useState('basic')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<BlogFormData>({
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    image: initialData?.image || '',
    category: initialData?.category || 'Actualités',
    tags: initialData?.tags || [],
    author: {
      name: initialData?.author?.name || 'Boss Vespa',
      role: initialData?.author?.role || 'Équipe Boss Vespa',
    },
    isPublished: initialData?.isPublished ?? false,
  })

  // Auto-generate slug from title (only in create mode and if slug hasn't been manually edited)
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }, [])

  const handleFieldChange = useCallback((field: keyof BlogFormData | string, value: unknown) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof BlogFormData] as Record<string, unknown>),
            [child]: value,
          },
        }
      }

      const newData = { ...prev, [field]: value }

      // Auto-generate slug when title changes (only in create mode)
      if (field === 'title' && mode === 'create') {
        newData.slug = generateSlug(value as string)
      }

      return newData
    })

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }, [mode, generateSlug, errors])

  const handleImageUpload = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image trop volumineuse. Maximum 10MB.')
      return
    }

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      handleFieldChange('image', url)
      toast.success('Image téléchargée avec succès!')
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }, [handleFieldChange])

  const handleImageRemove = useCallback(() => {
    handleFieldChange('image', '')
  }, [handleFieldChange])

  const handleTagAdd = useCallback((tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleFieldChange('tags', [...formData.tags, trimmedTag])
    }
    setTagInput('')
  }, [formData.tags, handleFieldChange])

  const handleTagRemove = useCallback((index: number) => {
    handleFieldChange('tags', formData.tags.filter((_, i) => i !== index))
  }, [formData.tags, handleFieldChange])

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleTagAdd(tagInput)
    }
  }, [tagInput, handleTagAdd])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Le slug ne doit contenir que des lettres minuscules, chiffres et tirets'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs avant de soumettre')
      return
    }

    setSaving(true)
    try {
      const endpoint = mode === 'create' ? '/api/blog' : `/api/blog/${initialData?.slug}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error?.includes('slug') || data.error?.includes('existe')) {
          setErrors({ slug: 'Ce slug existe déjà. Veuillez en choisir un autre.' })
          toast.error('Ce slug existe déjà')
        } else {
          throw new Error(data.error || 'Erreur lors de la sauvegarde')
        }
        return
      }

      onSuccess?.()
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de l\'article')
      console.error('Submit error:', error)
    } finally {
      setSaving(false)
    }
  }, [formData, mode, initialData?.slug, validateForm, onSuccess])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }, [handleImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-amber-400 text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Section: Basic Info */}
      {activeSection === 'basic' && (
        <Card className="bg-white/5 border-white/10 p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white font-medium">
              Titre <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Titre de l'article"
              className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${
                errors.title ? 'border-rose-500' : ''
              }`}
            />
            {errors.title && <p className="text-rose-400 text-sm">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-white font-medium flex items-center gap-2">
              <Lock size={14} className="text-white/40" />
              Slug <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleFieldChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="slug-de-l-article"
              className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${
                errors.slug ? 'border-rose-500' : ''
              }`}
              readOnly={mode === 'edit'}
            />
            {errors.slug && <p className="text-rose-400 text-sm">{errors.slug}</p>}
            {mode === 'create' && (
              <p className="text-white/40 text-xs">Généré automatiquement à partir du titre</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white font-medium">
              Description (SEO)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Courte description pour les moteurs de recherche..."
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-white font-medium">
              Catégorie
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleFieldChange('category', value)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.value}
                    value={cat.value}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

      {/* Section: Content */}
      {activeSection === 'content' && (
        <Card className="bg-white/5 border-white/10 p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-white font-medium">
              Contenu (Markdown) <span className="text-rose-400">*</span>
            </Label>
            <div data-color-mode="dark" className="rounded-xl overflow-hidden">
              <MDEditor
                value={formData.content}
                onChange={(value) => handleFieldChange('content', value || '')}
                height={500}
                preview="live"
                className="bg-slate-900!"
              />
            </div>
            {errors.content && <p className="text-rose-400 text-sm">{errors.content}</p>}
          </div>
        </Card>
      )}

      {/* Section: Media */}
      {activeSection === 'media' && (
        <Card className="bg-white/5 border-white/10 p-6 space-y-4">
          <Label className="text-white font-medium">Image à la une</Label>
          
          {formData.image ? (
            <div className="relative rounded-xl overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={formData.image}
                  alt="Image à la une"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={handleImageRemove}
                className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-xl p-12 text-center transition-colors cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                  <p className="text-white/60">Téléchargement en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Glissez-déposez une image ici</p>
                    <p className="text-white/40 text-sm">ou cliquez pour sélectionner</p>
                  </div>
                  <p className="text-white/30 text-xs">JPEG, PNG, WebP, GIF • Max 10MB</p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
            </div>
          )}
        </Card>
      )}

      {/* Section: Settings */}
      {activeSection === 'settings' && (
        <Card className="bg-white/5 border-white/10 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="authorName" className="text-white font-medium">
                Nom de l&apos;auteur
              </Label>
              <Input
                id="authorName"
                value={formData.author.name}
                onChange={(e) => handleFieldChange('author.name', e.target.value)}
                placeholder="Boss Vespa"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorRole" className="text-white font-medium">
                Rôle de l&apos;auteur
              </Label>
              <Input
                id="authorRole"
                value={formData.author.role}
                onChange={(e) => handleFieldChange('author.role', e.target.value)}
                placeholder="Équipe Boss Vespa"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400/20 text-amber-400 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleTagRemove(index)}
                    className="hover:bg-amber-400/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Ajouter un tag (Entrée pour valider)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              <Button
                type="button"
                onClick={() => handleTagAdd(tagInput)}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <Label className="text-white font-medium">Statut de publication</Label>
              <p className="text-white/40 text-sm">
                {formData.isPublished ? 'L\'article est visible publiquement' : 'L\'article est en brouillon'}
              </p>
            </div>
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(checked) => handleFieldChange('isPublished', checked)}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10"
          onClick={() => window.history.back()}
          disabled={saving}
        >
          <ArrowLeft size={16} className="mr-2" />
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="bg-amber-400 text-black hover:bg-amber-300 font-bold"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              {mode === 'create' ? 'Créer l\'article' : 'Enregistrer les modifications'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

