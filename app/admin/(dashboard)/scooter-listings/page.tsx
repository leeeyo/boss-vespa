'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from '@/hooks/use-session'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  StickyNote,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  Eye,
  Bike,
  MapPin,
  Calendar,
  Gauge,
  Banknote,
  BadgeCheck,
  XCircle,
  MessageSquare,
  HandCoins,
  Handshake,
  Search as SearchIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ScooterListing {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  brand: string
  scooterModel: string
  year: number
  color: string
  mileage: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  description?: string
  askingPrice: number
  images: string[]
  status: 'pending' | 'under_review' | 'negotiating' | 'purchased' | 'rejected'
  adminNotes?: string
  offeredPrice?: number
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
  { value: 'pending', label: 'En attente', icon: Clock, color: 'amber' },
  { value: 'under_review', label: 'En examen', icon: SearchIcon, color: 'blue' },
  { value: 'negotiating', label: 'Négociation', icon: Handshake, color: 'purple' },
  { value: 'purchased', label: 'Acheté', icon: CheckCircle2, color: 'emerald' },
  { value: 'rejected', label: 'Refusé', icon: XCircle, color: 'red' },
] as const

const CONDITION_LABELS: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Bon',
  fair: 'Correct',
  poor: 'À réviser',
}

export default function AdminScooterListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<ScooterListing[]>([])
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
  const [selectedListing, setSelectedListing] = useState<ScooterListing | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editStatus, setEditStatus] = useState<ScooterListing['status']>('pending')
  const [editNotes, setEditNotes] = useState('')
  const [editOfferedPrice, setEditOfferedPrice] = useState<number | ''>('')

  // Media lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxMedia, setLightboxMedia] = useState<string[]>([])

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ScooterListing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchListings = useCallback(async () => {
    if (session?.user?.role !== 'admin') return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const res = await fetch(`/api/scooter-listings?${params.toString()}`)
      const data = await res.json()
      setListings(data.listings || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      }))
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.role, pagination.page, pagination.limit, statusFilter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchListings()
    }
  }, [session, fetchListings])

  const getStatusColor = (status: ScooterListing['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
      case 'under_review':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
      case 'negotiating':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20'
      case 'purchased':
        return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
      case 'rejected':
        return 'bg-red-400/10 text-red-400 border-red-400/20'
      default:
        return 'bg-white/10 text-white/60'
    }
  }

  const getStatusBarColor = (status: ScooterListing['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-400'
      case 'under_review':
        return 'bg-blue-400'
      case 'negotiating':
        return 'bg-purple-400'
      case 'purchased':
        return 'bg-emerald-400'
      case 'rejected':
        return 'bg-red-400'
      default:
        return 'bg-white/40'
    }
  }

  const getStatusIcon = (status: ScooterListing['status']) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    return option?.icon || Clock
  }

  const getStatusLabel = (status: ScooterListing['status']) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    return option?.label || status
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-emerald-400'
      case 'good':
        return 'text-blue-400'
      case 'fair':
        return 'text-amber-400'
      case 'poor':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  const openDetail = (listing: ScooterListing) => {
    setSelectedListing(listing)
    setEditStatus(listing.status)
    setEditNotes(listing.adminNotes || '')
    setEditOfferedPrice(listing.offeredPrice || '')
    setIsDetailOpen(true)
  }

  const handleUpdateListing = async () => {
    if (!selectedListing) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/scooter-listings/${selectedListing._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editNotes,
          offeredPrice: editOfferedPrice || undefined,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setListings(prev =>
          prev.map(l => (l._id === updated._id ? updated : l))
        )
        setSelectedListing(updated)
      }
    } catch (error) {
      console.error('Failed to update listing:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const openLightbox = (media: string[], index: number) => {
    setLightboxMedia(media)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, listing: ScooterListing) => {
    e.stopPropagation()
    setDeleteTarget(listing)
    setShowDeleteDialog(true)
  }

  const handleDeleteListing = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/scooter-listings/${deleteTarget._id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setListings(prev => prev.filter(l => l._id !== deleteTarget._id))
        setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    }
  }

  // Filter by search term (client-side)
  const filteredListings = listings.filter(listing => {
    const searchLower = searchTerm.toLowerCase()
    return (
      listing.name.toLowerCase().includes(searchLower) ||
      listing.email.toLowerCase().includes(searchLower) ||
      listing.phone.toLowerCase().includes(searchLower) ||
      listing.brand.toLowerCase().includes(searchLower) ||
      listing.scooterModel.toLowerCase().includes(searchLower) ||
      listing.location.toLowerCase().includes(searchLower)
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
          <h1 className="text-4xl font-black bg-linear-to-r from-emerald-400 to-amber-500 bg-clip-text text-transparent">
            Scooters à vendre
          </h1>
          <p className="text-white/40 mt-2">
            {pagination.total} annonce{pagination.total > 1 ? 's' : ''} reçue{pagination.total > 1 ? 's' : ''}
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

      {/* Listings List */}
      <div className="grid gap-4">
        {filteredListings.length > 0 ? (
          filteredListings.map(listing => {
            const StatusIcon = getStatusIcon(listing.status)
            return (
              <Card
                key={listing._id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                onClick={() => openDetail(listing)}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Status Bar */}
                  <div
                    className={`w-full lg:w-2 h-1 lg:h-auto ${getStatusBarColor(listing.status)}`}
                  />

                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      {/* Scooter Image */}
                      {listing.images[0] && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
                          <Image
                            src={listing.images[0]}
                            alt={`${listing.brand} ${listing.scooterModel}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Main Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Bike size={18} className="text-emerald-400" />
                            {listing.brand} {listing.scooterModel}
                          </h3>
                          <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                            {listing.year}
                          </span>
                          <span className={`text-[10px] font-bold uppercase ${getConditionColor(listing.condition)}`}>
                            {CONDITION_LABELS[listing.condition]}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {listing.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {listing.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge size={14} />
                            {listing.mileage.toLocaleString()} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(listing.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Price & Status */}
                      <div className="flex items-center gap-4">
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xs text-white/40 uppercase tracking-wider">Prix demandé</p>
                          <p className="text-xl font-black text-amber-400">
                            {listing.askingPrice.toLocaleString()} TND
                          </p>
                          {listing.offeredPrice && (
                            <p className="text-xs text-emerald-400">
                              Offre: {listing.offeredPrice.toLocaleString()} TND
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${getStatusColor(listing.status)}`}
                        >
                          <StatusIcon size={12} />
                          {getStatusLabel(listing.status)}
                        </div>

                        {/* Admin Notes Indicator */}
                        {listing.adminNotes && (
                          <div className="text-white/40" title="Notes admin présentes">
                            <StickyNote size={18} />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetail(listing)
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-amber-400/20 text-white/60 hover:text-amber-400 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, listing)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-400/20 text-white/60 hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Bike className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60">Aucune annonce</h3>
            <p className="text-white/40">
              Les annonces de vente apparaîtront ici dès qu&apos;un vendeur soumettra une proposition.
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
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Bike className="text-emerald-400" />
              {selectedListing?.brand} {selectedListing?.scooterModel}
            </DialogTitle>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-6">
              {/* Scooter Photos */}
              {selectedListing.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                    <ImageIcon size={14} />
                    Photos ({selectedListing.images.length})
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {selectedListing.images.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(selectedListing.images, idx)}
                        className="aspect-square rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-amber-400 transition-all"
                      >
                        <Image
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scooter Info */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Informations Scooter
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">
                      <Bike size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Marque / Modèle</p>
                      <p className="font-bold">{selectedListing.brand} {selectedListing.scooterModel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Année</p>
                      <p className="font-bold">{selectedListing.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                      <Gauge size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Kilométrage</p>
                      <p className="font-bold">{selectedListing.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-400/10 flex items-center justify-center shrink-0">
                      <BadgeCheck size={18} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">État</p>
                      <p className={`font-bold ${getConditionColor(selectedListing.condition)}`}>
                        {CONDITION_LABELS[selectedListing.condition]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center shrink-0">
                      <div className="w-4 h-4 rounded-full border-2 border-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Couleur</p>
                      <p className="font-bold">{selectedListing.color}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                      <Banknote size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Prix demandé</p>
                      <p className="font-bold text-amber-400">{selectedListing.askingPrice.toLocaleString()} TND</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Informations Vendeur
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                      <User size={18} className="text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/40">Nom</p>
                      <p className="font-bold truncate">{selectedListing.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/40">Email</p>
                      <a
                        href={`mailto:${selectedListing.email}`}
                        className="font-bold hover:text-amber-400 transition-colors block truncate"
                      >
                        {selectedListing.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/40">Téléphone</p>
                      <a
                        href={`tel:${selectedListing.phone}`}
                        className="font-bold hover:text-amber-400 transition-colors block"
                      >
                        {selectedListing.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/40">Ville</p>
                      <p className="font-bold">{selectedListing.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedListing.description && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                    <MessageSquare size={14} />
                    Description du vendeur
                  </h4>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedListing.description}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="bg-white/5 rounded-xl p-4 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Mise à jour du statut
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Offered Price */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                  <HandCoins size={14} />
                  Prix proposé (TND)
                </h4>
                <Input
                  type="number"
                  value={editOfferedPrice}
                  onChange={e => setEditOfferedPrice(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Entrez votre offre..."
                  className="bg-white/5 border-white/10"
                />
                <p className="text-white/30 text-xs">
                  Prix demandé par le vendeur: <span className="text-amber-400 font-bold">{selectedListing.askingPrice.toLocaleString()} TND</span>
                </p>
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
                  placeholder="Ajoutez des notes internes sur cette annonce..."
                  className="bg-white/5 border-white/10 min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="border-white/10 text-black"
            >
              Fermer
            </Button>
            <Button
              onClick={handleUpdateListing}
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
              alt={`Photo ${lightboxIndex + 1}`}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black flex items-center gap-2">
              <Trash2 className="text-red-400" />
              Supprimer cette annonce ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Cette action est irréversible. L&apos;annonce de{' '}
              <strong className="text-white">{deleteTarget?.brand} {deleteTarget?.scooterModel}</strong> par{' '}
              <strong className="text-white">{deleteTarget?.name}</strong> sera définitivement
              supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListing}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

