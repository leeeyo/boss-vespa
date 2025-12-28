'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { 
  Palette, 
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  Phone,
  FileText,
  XCircle,
  User,
  Bike,
  ChevronRight,
  Truck,
  Store,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'

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
  contactInfo: ContactInfo
  deliveryPreference: 'pickup' | 'delivery'
  accessories: string[]
  status: 'pending' | 'contacted' | 'quoted' | 'approved' | 'rejected' | 'completed'
  createdAt: string
  estimatedPrice?: number
}

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    icon: Clock,
  },
  contacted: {
    label: 'Contacté',
    color: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    icon: Phone,
  },
  quoted: {
    label: 'Devis envoyé',
    color: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    icon: FileText,
  },
  approved: {
    label: 'Approuvée',
    color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Refusée',
    color: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    icon: XCircle,
  },
  completed: {
    label: 'Terminée',
    color: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
    icon: CheckCircle2,
  },
}

export default function AdminPersonalizationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Personalization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/personalization')
        .then((res) => res.json())
        .then((data) => {
          setItems(data.personalizations || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Demandes de Personnalisation
          </h1>
          <p className="text-white/40 mt-2">
            {items.length} demande{items.length !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status]
            const StatusIcon = statusConfig.icon
            
            return (
              <Link key={item._id} href={`/admin/personalizations/${item._id}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all overflow-hidden cursor-pointer group">
                  <div className="flex items-center p-6 gap-6">
                    {/* Color Preview */}
                    <div 
                      className="w-16 h-16 rounded-2xl shadow-2xl border border-white/10 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: item.color }}
                    >
                      <Palette className={`w-8 h-8 ${parseInt(item.color.replace('#', ''), 16) > 0xffffff / 2 ? 'text-black/50' : 'text-white/50'}`} />
                    </div>
                    
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-white">Vespa {item.vespaModel}</h3>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Bike size={10} />
                          {item.vespaModel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/40 text-xs flex-wrap">
                        <p className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="flex items-center gap-1">
                          <User size={12} />
                          {item.contactInfo.name}
                        </p>
                        <p className={`flex items-center gap-1 ${item.deliveryPreference === 'delivery' ? 'text-emerald-400/80' : 'text-white/40'}`}>
                          {item.deliveryPreference === 'delivery' ? (
                            <>
                              <Truck size={12} />
                              Livraison
                            </>
                          ) : (
                            <>
                              <Store size={12} />
                              Retrait
                            </>
                          )}
                        </p>
                        {item.deliveryPreference === 'delivery' && item.contactInfo.address && (
                          <p className="flex items-center gap-1 text-white/60 max-w-[200px] truncate">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{item.contactInfo.address}</span>
                          </p>
                        )}
                        {item.accessories.length > 0 && (
                          <p className="text-amber-400/80">
                            +{item.accessories.length} accessoire{item.accessories.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="flex items-center gap-6">
                      {item.estimatedPrice && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-white/40 uppercase tracking-wider">Estimé</p>
                          <p className="text-lg font-bold text-amber-400">{item.estimatedPrice.toLocaleString()} TND</p>
                        </div>
                      )}
                      
                      <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </div>
                      
                      <ChevronRight size={20} className="text-white/20 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Palette className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60">Aucune demande de personnalisation</h3>
            <p className="text-white/40">Les demandes apparaîtront ici dès qu&apos;un client personnalise sa Vespa.</p>
          </div>
        )}
      </div>
    </div>
  )
}

