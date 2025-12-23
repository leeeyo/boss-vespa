'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  FileText,
  Search,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MessageSquare,
  Image as ImageIcon,
  Package,
  StickyNote,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send,
  FileQuestion,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  images?: string[]
}

interface Devis {
  _id: string
  name: string
  email: string
  phone: string
  productId?: Product
  message?: string
  media: string[]
  status: 'pending' | 'contacted' | 'quoted' | 'closed'
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', icon: Clock },
  { value: 'contacted', label: 'Contacté', icon: Phone },
  { value: 'quoted', label: 'Devis envoyé', icon: Send },
  { value: 'closed', label: 'Clôturé', icon: CheckCircle2 },
] as const

export default function AdminDevisPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [devisList, setDevisList] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // Modal states
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editStatus, setEditStatus] = useState<Devis['status']>('pending')
  const [editNotes, setEditNotes] = useState('')

  // Media lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxMedia, setLightboxMedia] = useState<string[]>([])

  const fetchDevis = useCallback(async () => {
    if (session?.user?.role !== 'admin') return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const res = await fetch(`/api/devis?${params.toString()}`)
      const data = await res.json()
      setDevisList(data.devis || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      }))
    } catch (error) {
      console.error('Failed to fetch devis:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.role, pagination.page, pagination.limit, statusFilter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchDevis()
    }
  }, [session, fetchDevis])

  const getStatusColor = (status: Devis['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
      case 'contacted':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
      case 'quoted':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20'
      case 'closed':
        return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
      default:
        return 'bg-white/10 text-white/60'
    }
  }

  const getStatusIcon = (status: Devis['status']) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    return option?.icon || Clock
  }

  const getStatusLabel = (status: Devis['status']) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    return option?.label || status
  }

  const openDetail = (devis: Devis) => {
    setSelectedDevis(devis)
    setEditStatus(devis.status)
    setEditNotes(devis.adminNotes || '')
    setIsDetailOpen(true)
  }

  const handleUpdateDevis = async () => {
    if (!selectedDevis) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/devis/${selectedDevis._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editNotes,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setDevisList(prev =>
          prev.map(d => (d._id === updated._id ? updated : d))
        )
        setSelectedDevis(updated)
      }
    } catch (error) {
      console.error('Failed to update devis:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const openLightbox = (media: string[], index: number) => {
    setLightboxMedia(media)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // Filter by search term (client-side)
  const filteredDevis = devisList.filter(devis => {
    const searchLower = searchTerm.toLowerCase()
    return (
      devis.name.toLowerCase().includes(searchLower) ||
      devis.email.toLowerCase().includes(searchLower) ||
      devis.phone.toLowerCase().includes(searchLower) ||
      devis.message?.toLowerCase().includes(searchLower) ||
      devis.productId?.name?.toLowerCase().includes(searchLower)
    )
  })

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Gestion des Devis
          </h1>
          <p className="text-white/40 mt-2">
            {pagination.total} demande{pagination.total > 1 ? 's' : ''} de devis
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 focus:ring-amber-400/20"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10">
              <Filter size={16} className="mr-2 text-white/40" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Devis List */}
      <div className="grid gap-4">
        {filteredDevis.length > 0 ? (
          filteredDevis.map(devis => {
            const StatusIcon = getStatusIcon(devis.status)
            return (
              <Card
                key={devis._id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                onClick={() => openDetail(devis)}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Status Bar */}
                  <div
                    className={`w-full lg:w-2 h-1 lg:h-auto ${
                      devis.status === 'pending'
                        ? 'bg-amber-400'
                        : devis.status === 'contacted'
                        ? 'bg-blue-400'
                        : devis.status === 'quoted'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
                    }`}
                  />

                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      {/* Customer Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <User size={18} className="text-amber-400" />
                            {devis.name}
                          </h3>
                          {devis.productId && (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Package size={10} />
                              {devis.productId.name}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {devis.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {devis.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(devis.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {devis.message && (
                          <p className="text-white/40 text-sm line-clamp-1 flex items-center gap-2">
                            <MessageSquare size={14} className="shrink-0" />
                            {devis.message}
                          </p>
                        )}
                      </div>

                      {/* Media Preview & Status */}
                      <div className="flex items-center gap-4">
                        {/* Media Thumbnails */}
                        {devis.media.length > 0 && (
                          <div className="flex -space-x-2">
                            {devis.media.slice(0, 3).map((url, idx) => (
                              <div
                                key={idx}
                                className="w-10 h-10 rounded-lg border-2 border-zinc-800 overflow-hidden bg-white/5"
                              >
                                <Image
                                  src={url}
                                  alt={`Media ${idx + 1}`}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {devis.media.length > 3 && (
                              <div className="w-10 h-10 rounded-lg border-2 border-zinc-800 bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                                +{devis.media.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <div
                          className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${getStatusColor(
                            devis.status
                          )}`}
                        >
                          <StatusIcon size={12} />
                          {getStatusLabel(devis.status)}
                        </div>

                        {/* Admin Notes Indicator */}
                        {devis.adminNotes && (
                          <div className="text-white/40" title="Notes admin présentes">
                            <StickyNote size={18} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <FileQuestion className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60">Aucune demande de devis</h3>
            <p className="text-white/40">
              Les demandes apparaîtront ici dès qu&apos;un client soumettra une demande.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            className="border-white/10 bg-white/5"
          >
            <ChevronLeft size={16} />
            Précédent
          </Button>
          <span className="text-white/60 text-sm">
            Page {pagination.page} sur {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            className="border-white/10 bg-white/5"
          >
            Suivant
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <FileText className="text-amber-400" />
              Détails du Devis
            </DialogTitle>
          </DialogHeader>

          {selectedDevis && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Informations Client
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <User size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Nom</p>
                      <p className="font-bold">{selectedDevis.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                      <Mail size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Email</p>
                      <a
                        href={`mailto:${selectedDevis.email}`}
                        className="font-bold hover:text-amber-400 transition-colors"
                      >
                        {selectedDevis.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                      <Phone size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Téléphone</p>
                      <a
                        href={`tel:${selectedDevis.phone}`}
                        className="font-bold hover:text-amber-400 transition-colors"
                      >
                        {selectedDevis.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                      <Clock size={18} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Date de demande</p>
                      <p className="font-bold">
                        {new Date(selectedDevis.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              {selectedDevis.productId && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                    Produit concerné
                  </h4>
                  <div className="flex items-center gap-4">
                    {selectedDevis.productId.images?.[0] && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                        <Image
                          src={selectedDevis.productId.images[0]}
                          alt={selectedDevis.productId.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg">{selectedDevis.productId.name}</p>
                      <p className="text-white/40 text-sm">ID: {selectedDevis.productId._id}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedDevis.message && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                    <MessageSquare size={14} />
                    Message du client
                  </h4>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedDevis.message}</p>
                </div>
              )}

              {/* Media */}
              {selectedDevis.media.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                    <ImageIcon size={14} />
                    Médias joints ({selectedDevis.media.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedDevis.media.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(selectedDevis.media, idx)}
                        className="aspect-square rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-amber-400 transition-all"
                      >
                        <Image
                          src={url}
                          alt={`Media ${idx + 1}`}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="bg-white/5 rounded-xl p-4 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Mise à jour du statut
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    const isSelected = editStatus === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setEditStatus(opt.value)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? getStatusColor(opt.value) + ' ring-2 ring-current'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/60'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                  <StickyNote size={14} />
                  Notes administrateur
                </h4>
                <Textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Ajoutez des notes internes sur cette demande..."
                  className="bg-white/5 border-white/10 min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="border-white/10"
            >
              Fermer
            </Button>
            <Button
              onClick={handleUpdateDevis}
              disabled={isUpdating}
              className="bg-amber-400 text-black hover:bg-amber-500"
            >
              {isUpdating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {lightboxMedia.length > 1 && (
            <>
              <button
                onClick={() =>
                  setLightboxIndex(prev => (prev > 0 ? prev - 1 : lightboxMedia.length - 1))
                }
                className="absolute left-4 p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() =>
                  setLightboxIndex(prev => (prev < lightboxMedia.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-4 p-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] relative">
            <Image
              src={lightboxMedia[lightboxIndex]}
              alt={`Media ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-sm text-white/80">
              {lightboxIndex + 1} / {lightboxMedia.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

