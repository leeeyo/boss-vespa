'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  productId: {
    _id: string
    name: string
    images?: string[]
  } | string
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderId: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  paymentMethod: string
  paid: boolean
  createdAt: string
  deliveryAddress: {
    city: string
  }
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          setOrders(data.orders || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
      case 'confirmed': return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
      case 'shipping': return 'bg-purple-400/10 text-purple-400 border-purple-400/20'
      case 'delivered': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
      case 'cancelled': return 'bg-rose-400/10 text-rose-400 border-rose-400/20'
      default: return 'bg-white/10 text-white/60'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock
      case 'confirmed': return CheckCircle2
      case 'shipping': return Truck
      case 'delivered': return CheckCircle2
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    )
  }

  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.deliveryAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Link href="/admin/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm mb-4 transition-colors">
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Gestion des Commandes
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input 
              placeholder="Rechercher un ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 focus:ring-amber-400/20"
            />
          </div>
          <Button variant="outline" className="border-white/10 bg-white/5">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status)
            return (
              <Card key={order._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Status Bar */}
                  <div className={`w-1 lg:w-2 ${getStatusColor(order.status).split(' ')[1].replace('text-', 'bg-')}`} />
                  
                  <div className="flex-1 p-6 flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 w-full text-center lg:text-left">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-white/40 font-bold">ID Commande</p>
                        <p className="text-xl font-black text-white">{order.orderId}</p>
                      </div>
                      
                      <div className="h-10 w-px bg-white/5 hidden lg:block" />
                      
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Client & Ville</p>
                        <p className="text-lg font-bold text-white/90">{order.deliveryAddress?.city || 'N/A'}</p>
                      </div>

                      <div className="h-10 w-px bg-white/5 hidden lg:block" />

                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Date</p>
                        <p className="text-lg font-bold text-white/90">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:w-auto">
                      <div className="text-center lg:text-right min-w-[120px]">
                        <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">Montant</p>
                        <p className="text-2xl font-black text-amber-400 font-mono">
                          {order.total?.toLocaleString()} TND
                        </p>
                      </div>

                      <div className={`px-4 py-2 rounded-full border flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        <StatusIcon size={14} />
                        {order.status === 'pending' ? 'En attente' : 
                         order.status === 'confirmed' ? 'Confirmé' : 
                         order.status === 'shipping' ? 'En cours' : 
                         order.status === 'delivered' ? 'Livré' : 'Annulé'}
                      </div>

                      <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5">
                        <MoreVertical size={20} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <ShoppingCart className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60">Aucune commande trouvée</h3>
            <p className="text-white/40">Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  )
}

